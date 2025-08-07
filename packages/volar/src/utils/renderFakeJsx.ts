import type { Code } from "ts-macro";
import type { JsxElement, SourceFile } from "typescript";

/**
 * renders a dummy `JsxElement` into `Code[]` for JSXes replaced with something else. for...
 * - making TS to not incorrectly flag replaced components as unused
 * - displaying correct semantic highlighting
 * - providing typechecks and go-to-defs for each props
 * - providing autocompletes
 */
export const renderFakeJsx = (
	node: JsxElement,
	unspannedAttrs: string[],
	ts: typeof import("typescript"),
	ast?: SourceFile,
): Code[] => [
	"void (",
	["<", node.openingElement.getStart(ast)],
	[
		node.openingElement.tagName.getText(ast),
		node.openingElement.tagName.getStart(ast),
	],
	...node.openingElement.attributes.properties.flatMap((node): Code[] => {
		if (ts.isJsxSpreadAttribute(node)) {
			return [[node.getFullText(ast), node.pos]];
		}
		return [
			[node.name.getFullText(ast), node.name.pos],
			...(node.initializer
				? [
						"=",
						unspannedAttrs.includes(node.name.getText(ast))
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
	}),
	// insert dummy children for fulfilling typechecks
	" children={<></>}",
	["/>)", node.openingElement.end - 1],
];
