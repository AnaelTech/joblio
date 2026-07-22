import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";
import { updateProfile } from "../../../features/settings/actions";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		return new Response(JSON.stringify({ error: "Non authentifié" }), {
			status: 401,
			headers: { "content-type": "application/json" },
		});
	}

	const [user] = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			notifyFollowUp: users.notifyFollowUp,
			notifyInterview: users.notifyInterview,
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		return new Response(JSON.stringify({ error: "Utilisateur introuvable" }), {
			status: 404,
			headers: { "content-type": "application/json" },
		});
	}

	return new Response(JSON.stringify(user), {
		headers: { "content-type": "application/json" },
	});
};

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

	const result = await updateProfile(userId, body);

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
