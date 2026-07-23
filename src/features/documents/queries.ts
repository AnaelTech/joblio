import { db } from "@/db/client";
import { documents } from "@/db/schema/documents";
import { eq } from "drizzle-orm";

export interface DocumentRow {
	id: string;
	applicationId: string;
	type: string;
	filename: string;
	storagePath: string;
	mimeType: string | null;
	size: number | null;
	createdAt: Date;
}

export async function getDocuments(
	applicationId: string,
): Promise<DocumentRow[]> {
	return db
		.select()
		.from(documents)
		.where(eq(documents.applicationId, applicationId))
		.orderBy(documents.createdAt);
}

export async function getDocument(
	id: string,
): Promise<DocumentRow | undefined> {
	const rows = await db
		.select()
		.from(documents)
		.where(eq(documents.id, id))
		.limit(1);
	return rows[0];
}
