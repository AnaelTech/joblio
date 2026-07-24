import type { APIRoute } from "astro";
import { getVapidPublicKey } from "@/features/notifications/push";

export const prerender = false;

export const GET: APIRoute = async () => {
	return new Response(JSON.stringify({ publicKey: getVapidPublicKey() }), {
		headers: { "content-type": "application/json" },
	});
};
