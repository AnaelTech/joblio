import type { APIRoute } from "astro";
import { deleteDocument } from "@/features/documents/actions";

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
	const docId = params.docId;
	if (!docId) {
		return new Response(JSON.stringify({ error: "ID requis" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const result = await deleteDocument(docId);

	if (result.success) {
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}

	return new Response(JSON.stringify({ error: result.error }), {
		status: 400,
		headers: { "content-type": "application/json" },
	});
};
