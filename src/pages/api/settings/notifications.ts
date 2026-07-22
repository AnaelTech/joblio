import type { APIRoute } from "astro";
import { updateNotificationPreferences } from "../../../features/settings/actions";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}

	const text = await request.text();
	const body = JSON.parse(text || "{}");

	const result = await updateNotificationPreferences(userId, body);

	if (result.success) {
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ error: result.error }), {
		status: 400,
		headers: { "content-type": "application/json" },
	});
};
