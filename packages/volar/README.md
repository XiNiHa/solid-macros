# @solid-macros/volar

Volar/[TS Macro](https://github.com/ts-macro/ts-macro) plugin for improving Solid developer experience.

## Setup

```ts
// ts-macro.config.ts
import solidMacros from "@solid-macros/volar";

export default {
	plugins: [
		solidMacros({
			// plugin configuration goes here
		}),
	],
};
```

## Features

### typed-dom-jsx

Typecast JSX tags with DOM elements into corresponding HTML elements.

Pass `typedDomJsx: true` to the plugin config to enable.

```tsx
const el = <div />;
// before: JSX.Element
// after: HTMLDivElement
console.log(el.clientTop);
// before: type error
// after: correctly typechecked
```

### narrowed-show

Make `<Show>` narrow the types with the condition.

Pass `narrowedShow: true` to the plugin config to enable.

```tsx
const nullableArray: number[] | null = Math.random() > 0.5 ? [0] : null;

<Show
	when={nullableArray}
	fallback={nullableArray}
	// before: number[] | null
	// after: null
>
	{
		nullableArray.length
		// before: type error due to nullableArray being number[] | null
		// after: nullableArray narrowed to number[], no error
	}
</Show>;
```

### unwrapped-accessors

Automatically unwrap accessors as variables for hinting idempotency.

Pass `unwrappedAccessor: true` to the plugin config to enable.

```tsx
// the macro works based on the naming convention
// you can configure custom patterns using the `accessorPattern` option
const [wrapperRef$, setWrapperRef] = createSignal<HTMLElement | undefined>();
createEffect(() => {
	if (!wrapperRef$()) return;
	console.log(wrapperRef$().clientTop);
	// before: type error due wrapperRef() being HTMLElement | null
	// after: wrapperRef() narrowed to HTMLElement, no error
});
```
