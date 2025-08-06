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
