import { StrictMode } from "react";

import "@excalidraw/excalidraw/index.css";

import type * as TExcalidraw from "@excalidraw/excalidraw";

import ExcalidrawApp from "./ExcalidrawApp.tsx";

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
				<ExcalidrawApp
					appTitle={"Excalidraw Example"}
					useCustom={(api: any, args?: any[]) => {}}
					excalidrawLib={window.ExcalidrawLib}
				>
					<Excalidraw />
				</ExcalidrawApp>
			</StrictMode>
			,
		</>
	);
}
