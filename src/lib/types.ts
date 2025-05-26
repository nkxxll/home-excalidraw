import type * as TExcalidraw from "@excalidraw/excalidraw";

export interface Drawing {
	id: number;
	title: string;
	created: string;
	modified: string;
	data: string;
}

export type Comment = {
	x: number;
	y: number;
	value: string;
	id?: string;
};

export interface AppProps {
	initialData: null | any;
	customArgs?: any[];
	children: React.ReactNode;
	excalidrawLib: typeof TExcalidraw;
}
