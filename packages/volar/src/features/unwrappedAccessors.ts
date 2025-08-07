import { defu } from "defu";
import type { Context, TsmLanguagePlugin } from "ts-macro";
import type { BindingName } from "typescript";

export interface UnwrappedAccessorsOptions {
	/**
	 * Variable naming pattern for accessors
	 * @default /\$$/
	 */
	accessorPattern?: RegExp;
}

export const unwrappedAccessors = (
	{ ts }: Context,
	userOptions: UnwrappedAccessorsOptions | undefined,
): TsmLanguagePlugin => {
	const options = defu(userOptions, {
		accessorPattern: /\$$/,
	});

	return {
		name: "@solid-macros/volar/unwrapped-accessors",
		resolveVirtualCode({ ast, codes }) {
			let accessorNames: Set<string> | undefined;

			ast.forEachChild(function walk(node) {
				if (ts.isVariableStatement(node)) {
					const outerAccessorNames = accessorNames;
					accessorNames = new Set<string>();
					node.forEachChild(walk);
					const currentAccessorNames = accessorNames;
					accessorNames = outerAccessorNames;

					for (const name of currentAccessorNames) {
						codes.replaceRange(
							node.end,
							node.end,
							`\nconst _${name}$ = ${name}();`,
						);
					}
				} else if (
					ts.isBindingName(node) &&
					(!ts.isIdentifier(node) || ts.isVariableDeclaration(node.parent)) &&
					accessorNames
				) {
					function collectIdents(node: BindingName): string[] {
						return ts.isArrayBindingPattern(node)
							? node.elements
									.flatMap((element) => {
										if (ts.isBindingElement(element)) {
											return collectIdents(element.name);
										}
									})
									.filter((v) => v != null)
							: ts.isObjectBindingPattern(node)
								? node.elements.flatMap((element) =>
										collectIdents(element.name),
									)
								: [node.getText(ast)];
					}
					const idents = collectIdents(node);
					const accessors = idents.filter((ident) =>
						options.accessorPattern.test(ident),
					);
					for (const name of accessors) {
						accessorNames.add(name);
					}
				} else {
					if (
						ts.isCallExpression(node) &&
						node.arguments.length === 0 &&
						options.accessorPattern.test(node.expression.getText(ast))
					) {
						codes.replaceRange(node.getStart(ast), node.getEnd(), [
							`_${node.expression.getText(ast)}$`,
							node.expression.getStart(ast),
						]);
					}
					node.forEachChild(walk);
				}
			});
		},
	};
};
