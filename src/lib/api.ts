/**
 * here come the api functions
 */

import type { Drawing } from "./types";

export async function fetchLoadData() {
	const res = await fetch("/api/load");

	if (!res.ok) {
		throw new Error("Failed to load data");
	}

	return res.json();
}

export interface SaveDataProps {
	title: string;
	data: string;
}

export interface DeleteDataProps {
	id: number;
}

export interface UpdateDataProps {
	item: Drawing;
}

export async function fetchSaveData({ title, data }: SaveDataProps) {
	const body = JSON.stringify({
		title: title,
		created: new Date().toISOString(),
		modified: new Date().toISOString(),
		data,
	});
	const res = await fetch("/api/save", { method: "POST", body });
	if (!res.ok) {
		throw new Error("Failed to save data");
	}
	return res.json();
}

export async function fetchUpdateData({ item }: UpdateDataProps) {
	const body = JSON.stringify(item);
	const res = await fetch(`/api/update`, { method: "PUT", body });
	if (!res.ok) {
		throw new Error("Failed to update data");
	}
}

export async function fetchDeleteData({ id }: DeleteDataProps) {
	const res = await fetch(`/api/delete/${id}`, { method: "DELETE" });
	if (!res.ok) {
		throw new Error("Failed to delete data");
	}
}
