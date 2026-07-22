import type { APIRoute } from "astro";
import { getContacts } from "@/features/contacts/queries";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
	const userId = locals.user?.id;
	const q = url.searchParams.get("q") ?? undefined;
	const companyId = url.searchParams.get("companyId") ?? undefined;
	const rows = await getContacts({ userId, search: q, companyId });
	return new Response(JSON.stringify(rows), {
		headers: { "content-type": "application/json" },
	});
};
