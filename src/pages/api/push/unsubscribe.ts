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
		const { endpoint } = body;

		if (!endpoint) {
			return new Response(
				JSON.stringify({ error: "endpoint requis" }),
				{ status: 400, headers: { "content-type": "application/json" } },
			);
		}

		await db
			.delete(pushSubscriptions)
			.where(
				and(
					eq(pushSubscriptions.userId, userId),
					eq(pushSubscriptions.endpoint, endpoint),
				),
			);

		return new Response(JSON.stringify({ success: true }), {
			headers: { "content-type": "application/json" },
		});
	} catch {
		return new Response(
			JSON.stringify({ error: "Erreur lors du désabonnement" }),
			{ status: 500, headers: { "content-type": "application/json" } },
		);
	}
};
