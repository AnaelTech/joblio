import type { APIRoute } from "astro";
import { getCompanies } from "@/features/companies/queries";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
	const userId = locals.user?.id;
	const q = url.searchParams.get("q") ?? undefined;
	const rows = await getCompanies(userId, q);
	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
