import { createPlugin } from "ts-macro";
import { narrowedShow } from "./features/narrowedShow";
import { typedDomJsx } from "./features/typedDomJsx";
import {
	type UnwrappedAccessorsOptions,
	unwrappedAccessors,
} from "./features/unwrappedAccessors";

interface Options {
	/** Whether to typecast JSX tags with DOM elements into corresponding HTML elements */
	typedDomJsx?: boolean;
	/** Whether to make `<Show>` narrow the types with the condition */
	narrowedShow?: boolean;
	/** Whether to automatically unwrap accessors as variables for hinting idempotency */
	unwrappedAccessors?: boolean | UnwrappedAccessorsOptions;
}

export default createPlugin<Options | undefined>((ctx, options) => {
	return [
		options?.typedDomJsx && typedDomJsx(ctx),
		options?.narrowedShow && narrowedShow(ctx),
		options?.unwrappedAccessors &&
			unwrappedAccessors(
				ctx,
				typeof options.unwrappedAccessors === "object"
					? options.unwrappedAccessors
					: undefined,
			),
	].filter((v) => !!v);
});
