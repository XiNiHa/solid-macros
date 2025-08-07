import { onMount, Show } from "solid-js";

export default function App() {
	const div = <div />;

	onMount(() => {
		console.log(div.clientTop);
	});

	const nullable = Math.random() > 0.5 ? [] : null;

	return (
		<main>
			Hello world!
			{div}
			<Show when={nullable} fallback={nullable satisfies null}>
				{nullable.length}
			</Show>
		</main>
	);
}
