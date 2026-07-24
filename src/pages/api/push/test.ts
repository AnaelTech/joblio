import type { APIRoute } from "astro";
import { sendPushNotification } from "@/features/notifications/push";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}

	await sendPushNotification(userId, {
		title: "Joblio",
		body: "🔔 Les notifications push sont activées !",
		url: "/dashboard",
	});

	return new Response(JSON.stringify({ success: true }), {
		headers: { "content-type": "application/json" },
	});
};
