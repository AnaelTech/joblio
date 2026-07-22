import type { APIRoute } from "astro";
import { getCompanies } from "@/features/companies/queries";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const q = url.searchParams.get("q") ?? undefined;
	const rows = await getCompanies(q);
	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
