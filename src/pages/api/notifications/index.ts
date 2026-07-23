import type { APIRoute } from "astro";
import { getNotifications } from "@/features/notifications/service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
		});
	}

	const rows = await getNotifications(userId);
	return new Response(JSON.stringify(rows), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
};
