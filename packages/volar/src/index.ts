import { createPlugin, type TsmLanguagePlugin } from "ts-macro";

interface Options {
	/** Whether to typecast JSX tags with DOM elements into corresponding HTML elements */
	typedDomJsx?: boolean;
}

export default createPlugin(({ ts }, options: Options | undefined = {}) => {
	return [
		options.typedDomJsx &&
			({
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
			} satisfies TsmLanguagePlugin),
	].filter((v) => !!v);
});
