import type { APIRoute } from "astro";
import { getInterviews } from "@/features/interviews/queries";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
	const userId = locals.user?.id;
	const q = url.searchParams.get("q") ?? undefined;
	const result = url.searchParams.get("result") ?? undefined;
	const rows = await getInterviews({ userId, search: q, result });
	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
