import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@excalidraw/excalidraw/index.css";

import type * as TExcalidraw from "@excalidraw/excalidraw";

import App from "./App.tsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

declare global {
	interface Window {
		ExcalidrawLib: typeof TExcalidraw;
	}
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
root.render(
	<StrictMode>
    <QueryClientProvider client={queryClient}>
		<App />
    </QueryClientProvider>
	</StrictMode>,
);
