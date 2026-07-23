import type { APIRoute } from "astro";
import { markAllAsRead } from "@/features/notifications/service";

export const prerender = false;

export const PATCH: APIRoute = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
		});
	}

	await markAllAsRead(userId);
	return new Response(null, { status: 204 });
};
