import type { APIRoute } from "astro";
import {
	addApplicationTag,
	removeApplicationTag,
} from "@/features/applications/actions";

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
	const applicationId = params.id;
	if (!applicationId) {
		return new Response(JSON.stringify({ error: "ID requis" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const text = await request.text();
	const body = JSON.parse(text || "{}");
	const tagId = body.tagId;

	if (!tagId) {
		return new Response(JSON.stringify({ error: "tagId requis" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const result = await addApplicationTag(applicationId, tagId);

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

export const DELETE: APIRoute = async ({ params, request }) => {
	const applicationId = params.id;
	if (!applicationId) {
		return new Response(JSON.stringify({ error: "ID requis" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const text = await request.text();
	const body = JSON.parse(text || "{}");
	const tagId = body.tagId;

	if (!tagId) {
		return new Response(JSON.stringify({ error: "tagId requis" }), {
			status: 400,
			headers: { "content-type": "application/json" },
		});
	}

	const result = await removeApplicationTag(applicationId, tagId);

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
