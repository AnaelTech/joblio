import type { NotificationRow } from "./service";

const BASE = "/api/notifications";

export async function fetchNotifications(): Promise<NotificationRow[]> {
	const res = await fetch(BASE);
	if (!res.ok) throw new Error("Erreur lors du chargement");
	return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
	const res = await fetch(`${BASE}/unread-count`);
	if (!res.ok) throw new Error("Erreur");
	const data = await res.json();
	return data.count as number;
}

export async function markNotificationRead(id: string): Promise<void> {
	const res = await fetch(`${BASE}/${id}`, { method: "PATCH" });
	if (!res.ok) throw new Error("Erreur");
}

export async function markAllNotificationsRead(): Promise<void> {
	const res = await fetch(`${BASE}/read-all`, { method: "PATCH" });
	if (!res.ok) throw new Error("Erreur");
}
