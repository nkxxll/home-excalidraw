import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@excalidraw/excalidraw/index.css";

import type * as TExcalidraw from "@excalidraw/excalidraw";

import App from "./App.tsx";

declare global {
	interface Window {
		ExcalidrawLib: typeof TExcalidraw;
	}
}

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
