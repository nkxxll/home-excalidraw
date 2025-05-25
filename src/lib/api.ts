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
