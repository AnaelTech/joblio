import { useEffect, useRef } from "react";

async function getVapidPublicKey(): Promise<string> {
	const res = await fetch("/api/push/vapid-public-key");
	const data = await res.json();
	return data.publicKey;
}

async function subscribe(): Promise<void> {
	if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

	if (Notification.permission === "denied") return;

	if (Notification.permission === "default") {
		const permission = await Notification.requestPermission();
		if (permission !== "granted") return;
	}

	const registration = await navigator.serviceWorker.ready;
	const existing = await registration.pushManager.getSubscription();
	if (existing) {
		const sub = existing.toJSON();
		if (sub.endpoint) {
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
		return;
	}

	const publicKey = await getVapidPublicKey();
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: publicKey,
	});

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

export default function PushSetup() {
	const done = useRef(false);

	useEffect(() => {
		if (done.current) return;
		done.current = true;
		subscribe().catch(() => {});
	}, []);

	return null;
}
