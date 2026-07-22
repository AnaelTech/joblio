import type { ContactRow } from "./queries";

const BASE = "/api/contacts";

export async function fetchContacts(
	filters: { q?: string; companyId?: string } = {},
): Promise<ContactRow[]> {
	const params = new URLSearchParams();
	if (filters.q) params.set("q", filters.q);
	if (filters.companyId) params.set("companyId", filters.companyId);
	const qs = params.toString();
	const res = await fetch(`${BASE}${qs ? `?${qs}` : ""}`);
	if (!res.ok) throw new Error("Erreur lors du chargement");
	return res.json();
}

export async function updateContactApi(
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
		throw new Error(body.error ?? "Erreur lors de la mise à jour");
	}
}

export async function deleteContactApi(id: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors de la suppression");
	}
}
