/**
 * here come the api functions
 */

export async function fetchLoadData() {
	const res = await fetch("/api/load");

	if (!res.ok) {
		throw new Error("Failed to load data");
	}

	return res.json();
}

export async function fetchSaveData(data: string) {
	const body = JSON.stringify({
		created: new Date().toISOString(),
		modified: new Date().toISOString(),
		data,
	});
	const res = await fetch("/api/save", { method: "POST", body });
	if (!res.ok) {
		throw new Error("Failed to save data");
	}
}
