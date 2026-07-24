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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
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
		applicationServerKey: urlBase64ToUint8Array(publicKey),
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

		// Silently subscribe if permission already granted
		if (Notification.permission === "granted") {
			subscribeToPush().catch(() => {});
		}
		// On mobile, request permission on first visit if not yet decided
		else if (Notification.permission === "default" && /mobile|android|iphone|ipod|ipad/i.test(navigator.userAgent)) {
			Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					subscribeToPush().catch(() => {});
				}
			}).catch(() => {});
		}
	}, []);

	return null;
}
