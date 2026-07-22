import type { APIRoute } from "astro";
import { getContacts } from "@/features/contacts/queries";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const q = url.searchParams.get("q") ?? undefined;
	const companyId = url.searchParams.get("companyId") ?? undefined;
	const rows = await getContacts({ search: q, companyId });
	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
