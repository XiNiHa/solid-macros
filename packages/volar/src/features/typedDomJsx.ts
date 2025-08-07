import type { Context, TsmLanguagePlugin } from "ts-macro";

export const typedDomJsx = ({ ts }: Context): TsmLanguagePlugin => ({
	name: "@solid-macros/volar/typed-dom-jsx",
	resolveVirtualCode({ ast, codes, lang }) {
		if (!lang.endsWith("x")) return;
		ast.forEachChild(function walk(node) {
			if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
				const tagName = ts.isJsxElement(node)
					? node.openingElement.tagName
					: node.tagName;
				if (/^\s*[a-z]/.test(tagName.getText())) {
					codes.replaceRange(
						node.getFullStart(),
						node.getEnd(),
						"(",
						[node.getText(ast), node.getStart(ast)],
						` as HTMLElementTagNameMap["${tagName.getText(ast)}"])`,
					);
				}
			} else if (!ts.isJsxFragment(node)) {
				node.forEachChild(walk);
			}
		});
	},
});
