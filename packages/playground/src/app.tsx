import { onMount } from "solid-js";

export default function App() {
	const div = <div />;

	onMount(() => {
		console.log(div.clientTop);
	});

	return (
		<main>
			Hello world!
			{div}
		</main>
	);
}
