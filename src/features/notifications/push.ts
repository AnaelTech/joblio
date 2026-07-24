import "dotenv/config";
import webpush from "web-push";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { pushSubscriptions } from "@/db/schema/push-subscriptions";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@joblio.app";

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

export function getVapidPublicKey(): string {
	return vapidPublicKey;
}

export interface PushPayload {
	title: string;
	body?: string;
	url?: string;
}

export async function sendPushNotification(
	userId: string,
	payload: PushPayload,
): Promise<void> {
	const subscriptions = await db
		.select()
		.from(pushSubscriptions)
		.where(eq(pushSubscriptions.userId, userId));

	const results = await Promise.allSettled(
		subscriptions.map((sub) =>
			webpush.sendNotification(
				{
					endpoint: sub.endpoint,
					keys: { p256dh: sub.p256dh, auth: sub.auth },
				},
				JSON.stringify(payload),
			),
		),
	);

	const toDelete: string[] = [];
	for (let i = 0; i < results.length; i++) {
		const r = results[i];
		if (r.status === "rejected" && r.reason?.statusCode === 410) {
			toDelete.push(subscriptions[i].id);
		}
	}

	if (toDelete.length > 0) {
		await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, toDelete));
	}
}


