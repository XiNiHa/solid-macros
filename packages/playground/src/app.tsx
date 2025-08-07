import {
	createEffect,
	createSignal,
	Match,
	onMount,
	Show,
	Switch,
} from "solid-js";

export default function App() {
	const div = <div />;

	onMount(() => {
		console.log(div.clientTop);
	});

	const nullable = Math.random() > 0.5 ? [] : null;

	const [nullableNum$, setNullableNum] = createSignal<number | null>(
		Math.random(),
	);
	const reset = () =>
		setNullableNum(Math.random() > 0.5 ? Math.random() : null);

	createEffect(() => {
		if (nullableNum$() == null) return;
		console.log(nullableNum$().toLocaleString());
	});

	const [route$] = createSignal<"home" | "about" | "settings">();

	return (
		<main>
			Hello world!
			{div}
			<Show when={nullable} fallback={nullable satisfies null}>
				{nullable.length}
			</Show>
			<button type="button" onClick={reset}>
				<Show
					when={nullableNum$() != null}
					fallback={nullableNum$() satisfies null}
				>
					{nullableNum$().toLocaleString()}
				</Show>
			</button>
			<Switch fallback={`Not found: ${String(route$() satisfies undefined)}`}>
				<Match when={route$() === "home"}>
					{route$() satisfies "home"} Page
				</Match>
				<Match when={route$() === "about"}>
					{route$() satisfies "about"} Page
				</Match>
				<Match when={route$() === "settings"}>
					{route$() satisfies "settings"} Page
				</Match>
			</Switch>
		</main>
	);
}
