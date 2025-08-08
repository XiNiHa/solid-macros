import type { Code, Context, TsmLanguagePlugin } from "ts-macro";

export const jsxToFn = ({ ts }: Context): TsmLanguagePlugin => ({
	name: "@solid-macros/volar/jsx-to-fn",
	enforce: "post",
	resolveVirtualCode({ ast, codes, lang }) {
		if (!lang.endsWith("x")) return;
		ast.forEachChild(function walk(node) {
			if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
				const openingLike = ts.isJsxElement(node) ? node.openingElement : node;
				if (/^[A-Z]/.test(openingLike.tagName.getText(ast))) {
					const props = openingLike.attributes.properties;
					const contentfulChildren = ts.isJsxElement(node)
						? node.children.filter(
								(child) =>
									!ts.isJsxText(child) || child.getText(ast).trim().length > 0,
							)
						: [];

					codes.replaceRange(
						node.pos,
						node.end,
						[
							openingLike.tagName.getText(ast),
							openingLike.tagName.getStart(ast),
							{ semantic: { shouldHighlight: () => false } },
						],
						"({\n",
						...props.flatMap<Code>((prop) => {
							if (ts.isJsxAttribute(prop)) {
								return [
									[
										prop.name.getText(ast),
										prop.name.getStart(ast),
										{ semantic: { shouldHighlight: () => false } },
									],
									":",
									prop.initializer
										? ts.isJsxExpression(prop.initializer)
											? prop.initializer.expression
												? [
														prop.initializer.expression.getText(ast),
														prop.initializer.getStart(ast),
													]
												: "undefined"
											: [
													prop.initializer.getText(ast),
													prop.initializer.getStart(ast),
												]
										: "true",
									",\n",
								];
							}
							return [];
						}),
						...(ts.isJsxElement(node) && contentfulChildren.length > 0
							? ([
									..."children"
										.split("")
										.map((char): Code => [char, node.openingElement.end - 1]),
									":",
									...(contentfulChildren.length > 1
										? ([
												"[",
												...contentfulChildren.flatMap<Code>((node) => [
													[node.getFullText(ast), node.pos],
													",",
												]),
												"]",
											] satisfies Code[])
										: contentfulChildren.map<Code>((node) => [
												node.getFullText(ast),
												node.pos,
											])),
								] satisfies Code[])
							: []),
						"})",
					);
				}
			}
			node.forEachChild(walk);
		});
	},
});
