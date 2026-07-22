import type { TagRow } from "./queries";

const BASE = "/api/tags";

export async function fetchTags(): Promise<TagRow[]> {
	const res = await fetch(BASE);
	if (!res.ok) throw new Error("Erreur lors du chargement");
	return res.json();
}

export async function updateTagApi(
	id: string,
	data: Record<string, unknown>,
): Promise<void> {
	const res = await fetch(`${BASE}/${id}`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors de la modification");
	}
}

export async function deleteTagApi(id: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors de la suppression");
	}
}
