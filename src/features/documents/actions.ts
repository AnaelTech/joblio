import { db } from "@/db/client";
import { documents } from "@/db/schema/documents";
import { eq } from "drizzle-orm";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { DOCUMENT_TYPES } from "@/features/documents/schema";

const UPLOADS_DIR = join(process.cwd(), "public", "uploads");
const MAX_SIZE = 10 * 1024 * 1024;

const EXTENSION_MAP: Record<string, string[]> = {
	"application/pdf": ["pdf"],
	"image/png": ["png"],
	"image/jpeg": ["jpg", "jpeg"],
	"image/webp": ["webp"],
	"application/msword": ["doc"],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
		"docx",
	],
	"text/plain": ["txt"],
};

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
	"application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
	"image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
	"image/jpeg": [new Uint8Array([0xff, 0xd8])],
	"image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
	"application/msword": [new Uint8Array([0xd0, 0xcf, 0x11, 0xe0])],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
		new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
	],
};

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

function checkMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
	const signatures = MAGIC_BYTES[mimeType];
	if (!signatures) return true;
	return signatures.some((sig) => {
		if (buffer.length < sig.length) return false;
		return sig.every((byte, i) => buffer[i] === byte);
	});
}

export async function uploadDocument(
	applicationId: string,
	type: string,
	file: File,
): Promise<
	| {
			success: true;
			document: {
				id: string;
				filename: string;
				storagePath: string;
				mimeType: string | null;
				size: number;
			};
	  }
	| { success: false; error: string }
> {
	try {
		if (!DOCUMENT_TYPES.includes(type as (typeof DOCUMENT_TYPES)[number])) {
			return { success: false, error: "Type de document invalide" };
		}

		if (file.size === 0) {
			return { success: false, error: "Le fichier est vide" };
		}

		if (file.size > MAX_SIZE) {
			return { success: false, error: "Le fichier ne doit pas dépasser 10 Mo" };
		}

		if (/[\/\\\0<>:"|?*]/.test(file.name)) {
			return { success: false, error: "Nom de fichier invalide" };
		}

		const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
		const allowedMimes = Object.keys(EXTENSION_MAP);

		if (file.type && !allowedMimes.includes(file.type)) {
			return {
				success: false,
				error: "Type de fichier non autorisé (PDF, images, DOC, DOCX, TXT)",
			};
		}

		if (file.type && ext) {
			const expectedExts = EXTENSION_MAP[file.type];
			if (expectedExts && !expectedExts.includes(ext)) {
				return {
					success: false,
					error: "L'extension du fichier ne correspond pas à son type",
				};
			}
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		if (file.type && !checkMagicBytes(new Uint8Array(buffer), file.type)) {
			return {
				success: false,
				error: "Le contenu du fichier ne correspond pas au type déclaré",
			};
		}

		const storedName = `${randomUUID()}.${ext || "bin"}`;
		const relativePath = `/uploads/${applicationId}/${storedName}`;
		const absolutePath = join(UPLOADS_DIR, applicationId);

		await mkdir(absolutePath, { recursive: true });
		await writeFile(join(absolutePath, storedName), buffer);

		const [doc] = await db
			.insert(documents)
			.values({
				applicationId,
				type,
				filename: file.name,
				storagePath: relativePath,
				mimeType: file.type || null,
				size: file.size,
			})
			.returning({
				id: documents.id,
				filename: documents.filename,
				storagePath: documents.storagePath,
				mimeType: documents.mimeType,
				size: documents.size,
			});

		return {
			success: true,
			document: {
				id: doc.id,
				filename: doc.filename,
				storagePath: doc.storagePath,
				mimeType: doc.mimeType,
				size: doc.size ?? file.size,
			},
		};
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de l'upload"),
		};
	}
}

export async function deleteDocument(
	id: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const [doc] = await db
			.select({ storagePath: documents.storagePath })
			.from(documents)
			.where(eq(documents.id, id))
			.limit(1);

		if (!doc) {
			return { success: false, error: "Document introuvable" };
		}

		await db.delete(documents).where(eq(documents.id, id));

		const absolutePath = join(process.cwd(), "public", doc.storagePath);
		await unlink(absolutePath).catch(() => {});

		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la suppression"),
		};
	}
}
