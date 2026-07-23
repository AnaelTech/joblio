import type { ApplicationData } from "./components/ApplicationModal";

const BASE = "/api/applications";

export async function fetchApplications(
	filters: {
		q?: string;
		status?: string;
		priority?: string;
		archived?: string;
	} = {},
): Promise<ApplicationData[]> {
	const params = new URLSearchParams();
	if (filters.q) params.set("q", filters.q);
	if (filters.status) params.set("status", filters.status);
	if (filters.priority) params.set("priority", filters.priority);
	if (filters.archived) params.set("archived", filters.archived);
	const qs = params.toString();
	const res = await fetch(`${BASE}${qs ? `?${qs}` : ""}`);
	if (!res.ok) throw new Error("Erreur lors du chargement");
	return res.json();
}

export async function updateApplicationApi(
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

export async function deleteApplicationApi(id: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors de la suppression");
	}
}

export async function addApplicationTagApi(
	applicationId: string,
	tagId: string,
): Promise<void> {
	const res = await fetch(`${BASE}/${applicationId}/tags`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ tagId }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors de l'ajout du tag");
	}
}

export async function removeApplicationTagApi(
	applicationId: string,
	tagId: string,
): Promise<void> {
	const res = await fetch(`${BASE}/${applicationId}/tags`, {
		method: "DELETE",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ tagId }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors du retrait du tag");
	}
}

export async function fetchAllTags(): Promise<
	{ id: string; name: string; color: string | null }[]
> {
	const res = await fetch("/api/tags");
	if (!res.ok) throw new Error("Erreur lors du chargement des tags");
	return res.json();
}
