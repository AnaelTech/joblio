import type { APIRoute } from "astro";
import { getDocuments } from "@/features/documents/queries";
import { uploadDocument } from "@/features/documents/actions";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID requis" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const rows = await getDocuments(id);
  return new Response(JSON.stringify(rows), {
    headers: { "content-type": "application/json" },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID requis" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const formData = await request.formData();
  const type = formData.get("type") as string;
  const file = formData.get("file") as File;

  if (!type || !file) {
    return new Response(JSON.stringify({ error: "type et file requis" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const result = await uploadDocument(id, type, file);

  if (result.success) {
    return new Response(JSON.stringify(result.document), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: result.error }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
};
