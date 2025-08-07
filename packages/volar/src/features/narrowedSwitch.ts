import type { Code, Context, TsmLanguagePlugin } from "ts-macro";
import type { JsxAttribute } from "typescript";
import { renderFakeJsx } from "../utils/renderFakeJsx";

export const narrowedSwitch = ({ ts }: Context): TsmLanguagePlugin => ({
	name: "@solid-macros/volar/narrowed-switch",
	resolveVirtualCode({ ast, codes, lang }) {
		if (!lang.endsWith("x")) return;
		const switchCompNames = new Set<string>();
		const matchCompNames = new Set<string>();
		ast.forEachChild(function walk(node) {
			if (ts.isImportSpecifier(node)) {
				if ((node.propertyName ?? node.name).text === "Switch") {
					switchCompNames.add(node.name.text);
				} else if ((node.propertyName ?? node.name).text === "Match") {
					matchCompNames.add(node.name.text);
				}
			}
			if (
				ts.isJsxElement(node) &&
				switchCompNames.has(node.openingElement.tagName.getText(ast))
			) {
				const matches = node.children
					.map((node) => {
						if (
							ts.isJsxElement(node) &&
							matchCompNames.has(node.openingElement.tagName.getText(ast))
						) {
							const condition = node.openingElement.attributes.properties.find(
								(node): node is JsxAttribute =>
									ts.isJsxAttribute(node) && node.name.getText(ast) === "when",
							);
							if (!condition?.initializer) return;
							return {
								node,
								condition: ts.isJsxExpression(condition.initializer)
									? condition.initializer.expression
									: condition.initializer,
								children: node.children,
							};
						}
					})
					.filter((v) => v != null);
				const fallback = node.openingElement.attributes.properties.find(
					(node): node is JsxAttribute =>
						ts.isJsxAttribute(node) && node.name.getText(ast) === "fallback",
				);
				if (matches.length > 0) {
					const fallbackExpr =
						fallback?.initializer &&
						(ts.isJsxExpression(fallback?.initializer)
							? fallback.initializer.expression
							: fallback?.initializer);
					const isInJsx =
						ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent);

					codes.replaceRange(
						node.pos,
						node.end,
						isInJsx ? "{" : "",
						...renderFakeJsx(node, ["fallback", "children"], ts, ast),
						...matches.flatMap(({ node }) => [
							", ",
							...renderFakeJsx(node, ["when", "children"], ts, ast),
						]),
						",\n(",
						// convert to a ternary chain
						...matches.flatMap<Code>(({ condition, children }) => [
							"(",
							condition
								? [condition.getFullText(ast), condition.pos]
								: "undefined",
							") ? <>",
							...children.map(
								(child): Code => [child.getFullText(ast), child.pos],
							),
							"</> : ",
						]),
						fallbackExpr
							? [fallbackExpr.getFullText(ast), fallbackExpr.pos]
							: "null",
						")",
						isInJsx ? "}" : "",
					);
				}
			}
			node.forEachChild(walk);
		});
	},
});
