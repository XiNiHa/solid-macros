import type { Code, Context, TsmLanguagePlugin } from "ts-macro";

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
						//
						isInJsx ? "{" : "",
						// convert to a ternary
						"(",
						// insert dummy <Show> for...
						// - making TS to not incorrectly flag Show as unused
						// - displaying correct semantic highlighting
						// - providing typechecks and go-to-defs for each props
						// - providing autocompletes
						["<", node.openingElement.getStart(ast)],
						[
							node.openingElement.tagName.getText(ast),
							node.openingElement.tagName.getStart(ast),
						],
						...node.openingElement.attributes.properties.flatMap(
							(node): Code[] => {
								if (ts.isJsxSpreadAttribute(node)) {
									return [[node.getFullText(ast), node.pos]];
								}

								return [
									[node.name.getFullText(ast), node.name.pos],
									...(node.initializer
										? [
												"=",
												["when", "fallback", "children"].includes(
													node.name.getText(ast),
												)
													? // omit spans as they're used again later
														node.initializer.getFullText(ast)
													: // provide spans so typescript can work
														([
															node.initializer.getFullText(ast),
															node.initializer.pos,
														] satisfies Code),
											]
										: []),
								];
							},
						),
						// insert dummy children for fulfilling typechecks
						" children={<></>}",
						["/>", node.openingElement.end - 1],
						") && ((",
						conditionExpr
							? [conditionExpr.getText(ast), conditionExpr.getStart(ast)]
							: "undefined",
						") ? <>",
						...node.children.map(
							(child): Code => [child.getText(ast), child.getStart(ast)],
						),
						"</> : ",
						fallbackExpr
							? [fallbackExpr.getText(ast), fallbackExpr.getStart(ast)]
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
