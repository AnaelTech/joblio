export interface DocumentResponse {
  id: string;
  applicationId: string;
  type: string;
  filename: string;
  storagePath: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
}

export async function fetchDocuments(
  applicationId: string,
): Promise<DocumentResponse[]> {
  const res = await fetch(`/api/applications/${applicationId}/documents`);
  if (!res.ok) throw new Error("Erreur lors du chargement");
  return res.json();
}

export async function uploadDocumentApi(
  applicationId: string,
  type: string,
  file: File,
): Promise<DocumentResponse> {
  const formData = new FormData();
  formData.set("type", type);
  formData.set("file", file);
  const res = await fetch(`/api/applications/${applicationId}/documents`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erreur lors de l'upload");
  }
  return res.json();
}

export async function deleteDocumentApi(
  applicationId: string,
  docId: string,
): Promise<void> {
  const res = await fetch(
    `/api/applications/${applicationId}/documents/${docId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Erreur lors de la suppression");
  }
}
