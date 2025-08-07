import { createPlugin } from "ts-macro";
import { narrowedShow } from "./features/narrowedShow";
import { typedDomJsx } from "./features/typedDomJsx";

interface Options {
	/** Whether to typecast JSX tags with DOM elements into corresponding HTML elements */
	typedDomJsx?: boolean;
	/** Whether to make `<Show>` narrow the types with the condition */
	narrowedShow?: boolean;
}

export default createPlugin<Options | undefined>((ctx, options) => {
	return [
		options?.typedDomJsx && typedDomJsx(ctx),
		options?.narrowedShow && narrowedShow(ctx),
	].filter((v) => !!v);
});
