import type { Code, Context, TsmLanguagePlugin } from "ts-macro";
import { renderFakeJsx } from "../utils/renderFakeJsx";

export const narrowedShow = ({ ts }: Context): TsmLanguagePlugin => ({
	name: "@solid-macros/volar/narrowed-show",
	resolveVirtualCode({ ast, codes, lang }) {
		if (!lang.endsWith("x")) return;
		const showCompNames = new Set<string>();
		ast.forEachChild(function walk(node) {
			if (
				ts.isImportSpecifier(node) &&
				(node.propertyName ?? node.name).text === "Show"
			) {
				showCompNames.add(node.name.text);
			}
			if (
				ts.isJsxElement(node) &&
				showCompNames.has(node.openingElement.tagName.getText(ast))
			) {
				const condition = node.openingElement.attributes.properties.find(
					(node): node is import("typescript").JsxAttribute =>
						ts.isJsxAttribute(node) && node.name.getText(ast) === "when",
				);
				const fallback = node.openingElement.attributes.properties.find(
					(node): node is import("typescript").JsxAttribute =>
						ts.isJsxAttribute(node) && node.name.getText(ast) === "fallback",
				);
				if (condition?.initializer) {
					const conditionExpr = ts.isJsxExpression(condition.initializer)
						? condition.initializer.expression
						: condition.initializer;
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
						"(",
						...renderFakeJsx(node, ["when", "fallback", "children"], ts, ast),
						",\n(",
						// convert to a ternary
						conditionExpr
							? [conditionExpr.getFullText(ast), conditionExpr.pos]
							: "undefined",
						") ? <>",
						...node.children.map(
							(child): Code => [child.getFullText(ast), child.pos],
						),
						"</> : ",
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
