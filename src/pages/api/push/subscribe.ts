import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { pushSubscriptions } from "@/db/schema/push-subscriptions";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}

	try {
		const body = await request.json();
		const { endpoint, p256dh, auth } = body;

		if (!endpoint || !p256dh || !auth) {
			return new Response(
				JSON.stringify({ error: "endpoint, p256dh et auth requis" }),
				{ status: 400, headers: { "content-type": "application/json" } },
			);
		}

		const existing = await db
			.select({ id: pushSubscriptions.id })
			.from(pushSubscriptions)
			.where(
				and(
					eq(pushSubscriptions.userId, userId),
					eq(pushSubscriptions.endpoint, endpoint),
				),
			)
			.limit(1);

		if (existing.length === 0) {
			await db.insert(pushSubscriptions).values({
				userId,
				endpoint,
				p256dh,
				auth,
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			headers: { "content-type": "application/json" },
		});
	} catch {
		return new Response(JSON.stringify({ error: "Erreur lors de l'inscription" }), {
			status: 500,
			headers: { "content-type": "application/json" },
		});
	}
};
