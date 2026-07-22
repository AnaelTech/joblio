import type { APIRoute } from "astro";
import { updateApplication, deleteApplication } from "@/features/applications/actions";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID requis" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const text = await request.text();
  const body = JSON.parse(text || "{}");

  const result = await updateApplication(id, body);

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

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID requis" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const result = await deleteApplication(id);

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
