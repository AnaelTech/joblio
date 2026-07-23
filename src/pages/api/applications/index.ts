import type { APIRoute } from "astro";
import { getApplications } from "@/features/applications/queries";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
	const userId = locals.user?.id;
	const search = url.searchParams.get("q") ?? undefined;
	const status = url.searchParams.get("status") ?? undefined;
	const priority = url.searchParams.get("priority") ?? undefined;
	const archived = url.searchParams.get("archived") ?? undefined;

	const rows = await getApplications({
		userId,
		search,
		status,
		priority,
		archived,
	});

	return new Response(JSON.stringify(rows), {
		status: 200,
		headers: { "content-type": "application/json" },
	});
};
