import type { JSX } from "solid-js";

function ErrorFree(props: { children: JSX.Element & Errorable<never> }) {
	return (<>{props.children}</>) as JSX.Element & Errorable<never>;
}

function ErrorBoundary<T, U, V = U extends undefined ? never : U>(props: {
	children: JSX.Element & Errorable<T>;
	handle: (error: T) => U;
}) {
	return (<>{props.children}</>) as JSX.Element & Errorable<V>;
}

const ErrorTag = Symbol("Error");
type Errorable<T> = { [ErrorTag]: T };

function Comp<T>(props: { children: JSX.Element & Errorable<T> }) {
	return (<>{props.children}</>) as JSX.Element & Errorable<T>;
}

function WithError(props: { foo?: string }) {
	return (<div>WithError {props.foo}</div>) as unknown as JSX.Element &
		Errorable<"foo">;
}

export default function App() {
	return (
		<ErrorFree>
			<Comp>
				<WithError foo="bar" />
			</Comp>
		</ErrorFree>
	);
}
