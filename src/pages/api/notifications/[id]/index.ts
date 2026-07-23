import type { APIRoute } from "astro";
import { markAsRead } from "@/features/notifications/service";

export const prerender = false;

export const PATCH: APIRoute = async ({ params }) => {
	const { id } = params;
	if (!id) {
		return new Response(JSON.stringify({ error: "ID requis" }), {
			status: 400,
		});
	}

	await markAsRead(id);
	return new Response(null, { status: 204 });
};
