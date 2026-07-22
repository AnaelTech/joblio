import type { APIRoute } from "astro";
import { changePassword } from "../../../features/settings/actions";

export const prerender = false;

export const PATCH: APIRoute = async ({ request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}

	const text = await request.text();
	const body = JSON.parse(text || "{}");

	if (!body.currentPassword || !body.newPassword) {
		return new Response(
			JSON.stringify({
				error: "Mot de passe actuel et nouveau mot de passe requis",
			}),
			{
				status: 400,
				headers: { "content-type": "application/json" },
			},
		);
	}

	if (body.newPassword.length < 6) {
		return new Response(
			JSON.stringify({
				error: "Le nouveau mot de passe doit contenir au moins 6 caractères",
			}),
			{
				status: 400,
				headers: { "content-type": "application/json" },
			},
		);
	}

	const result = await changePassword(
		userId,
		body.currentPassword,
		body.newPassword,
	);

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
