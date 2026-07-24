import { useEffect, useRef } from "react";

async function getVapidPublicKey(): Promise<string | null> {
	try {
		const res = await fetch("/api/push/vapid-public-key");
		const data = await res.json();
		return data.publicKey ?? null;
	} catch {
		return null;
	}
}

async function sendSubscription(subscription: PushSubscription): Promise<void> {
	const sub = subscription.toJSON();
	await fetch("/api/push/subscribe", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			endpoint: sub.endpoint,
			p256dh: sub.keys?.p256dh ?? "",
			auth: sub.keys?.auth ?? "",
		}),
	});
}

export async function subscribeToPush(): Promise<void> {
	if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
	if (Notification.permission !== "granted") return;

	const publicKey = await getVapidPublicKey();
	if (!publicKey) return;

	const registration = await navigator.serviceWorker.ready;
	const existing = await registration.pushManager.getSubscription();

	if (existing) {
		await sendSubscription(existing);
		return;
	}

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: publicKey,
	});
	await sendSubscription(subscription);
}

export async function unsubscribeFromPush(): Promise<void> {
	if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

	const registration = await navigator.serviceWorker.ready;
	const existing = await registration.pushManager.getSubscription();

	if (existing) {
		const sub = existing.toJSON();
		await existing.unsubscribe();
		await fetch("/api/push/unsubscribe", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ endpoint: sub.endpoint }),
		});
	}
}

export default function PushSetup() {
	const done = useRef(false);

	useEffect(() => {
		if (done.current) return;
		done.current = true;
		subscribeToPush().catch(() => {});
	}, []);

	return null;
}
