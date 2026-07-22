import type { APIRoute } from "astro";
import { getTags } from "@/features/tags/queries";

export const prerender = false;

export const GET: APIRoute = async () => {
	const rows = await getTags();
	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
