import { StrictMode } from "react";

import "@excalidraw/excalidraw/index.css";

import type * as TExcalidraw from "@excalidraw/excalidraw";

import ExampleApp from "./ExcalidrawApp.tsx";

declare global {
	interface Window {
		ExcalidrawLib: typeof TExcalidraw;
	}
}

export default function App() {
	const { Excalidraw } = window.ExcalidrawLib;
	return (
		<>
			<StrictMode>
				<ExampleApp excalidrawLib={window.ExcalidrawLib}>
					<Excalidraw />
				</ExampleApp>
			</StrictMode>
			,
		</>
	);
}
