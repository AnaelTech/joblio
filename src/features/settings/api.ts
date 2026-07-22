const BASE = "/api/settings";

export interface UserSettings {
	id: string;
	name: string;
	email: string;
	notifyFollowUp: boolean;
	notifyInterview: boolean;
}

export async function fetchSettings(): Promise<UserSettings> {
	const res = await fetch(`${BASE}/profile`);
	if (!res.ok) throw new Error("Erreur lors du chargement");
	return res.json();
}

export async function updateProfileApi(
	data: Record<string, unknown>,
): Promise<void> {
	const res = await fetch(`${BASE}/profile`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors de la mise à jour");
	}
}

export async function changePasswordApi(data: {
	currentPassword: string;
	newPassword: string;
}): Promise<void> {
	const res = await fetch(`${BASE}/password`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error ?? "Erreur lors du changement de mot de passe");
	}
}

export async function updateNotificationPreferencesApi(data: {
	notifyFollowUp?: boolean;
	notifyInterview?: boolean;
}): Promise<void> {
	const res = await fetch(`${BASE}/notifications`, {
		method: "PATCH",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(
			body.error ?? "Erreur lors de la mise à jour des préférences",
		);
	}
}
