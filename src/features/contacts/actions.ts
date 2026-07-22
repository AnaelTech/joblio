import { db } from "@/db/client";
import { contacts } from "@/db/schema/contacts";
import { type CreateContactInput } from "./schema";
import { eq } from "drizzle-orm";

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function createContact(
	input: CreateContactInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
	try {
		const [contact] = await db
			.insert(contacts)
			.values({
				name: input.name,
				companyId: input.companyId,
				role: input.role ?? null,
				email: input.email || null,
				phone: input.phone ?? null,
				linkedin: input.linkedin || null,
				notes: input.notes ?? null,
			})
			.returning({ id: contacts.id });

		return { success: true, id: contact.id };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la création") };
	}
}

export async function updateContact(
	id: string,
	input: Record<string, unknown>,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db
			.update(contacts)
			.set({
				name: input.name as string,
				role: (input.role as string) ?? null,
				email: (input.email as string) ?? null,
				phone: (input.phone as string) ?? null,
				linkedin: (input.linkedin as string) ?? null,
				notes: (input.notes as string) ?? null,
			})
			.where(eq(contacts.id, id));

		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la modification") };
	}
}

export async function deleteContact(
	id: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db.delete(contacts).where(eq(contacts.id, id));
		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la suppression") };
	}
}
