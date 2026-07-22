import { db } from "@/db/client";
import { contacts } from "@/db/schema/contacts";
import { companies } from "@/db/schema/companies";
import { type CreateContactInput, updateContactSchema } from "./schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function createContact(
	userId: string,
	input: CreateContactInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
	try {
		const [company] = await db
			.select({ id: companies.id })
			.from(companies)
			.where(and(eq(companies.id, input.companyId), eq(companies.userId, userId)))
			.limit(1);

		if (!company) {
			return { success: false, error: "Entreprise introuvable" };
		}

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
	userId: string,
	input: Record<string, unknown>,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const parsed = updateContactSchema.parse(input);

		const [contact] = await db
			.select({ id: contacts.id })
			.from(contacts)
			.innerJoin(companies, eq(contacts.companyId, companies.id))
			.where(and(eq(contacts.id, id), eq(companies.userId, userId)))
			.limit(1);

		if (!contact) {
			return { success: false, error: "Contact introuvable" };
		}

		await db
			.update(contacts)
			.set({
				name: parsed.name,
				role: parsed.role ?? null,
				email: parsed.email ?? null,
				phone: parsed.phone ?? null,
				linkedin: parsed.linkedin ?? null,
				notes: parsed.notes ?? null,
			})
			.where(eq(contacts.id, id));

		return { success: true };
	} catch (e) {
		if (e instanceof z.ZodError) {
			return { success: false, error: e.errors.map((err) => err.message).join(", ") };
		}
		return { success: false, error: getErrorMessage(e, "Erreur lors de la modification") };
	}
}

export async function deleteContact(
	id: string,
	userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const [contact] = await db
			.select({ id: contacts.id })
			.from(contacts)
			.innerJoin(companies, eq(contacts.companyId, companies.id))
			.where(and(eq(contacts.id, id), eq(companies.userId, userId)))
			.limit(1);

		if (!contact) {
			return { success: false, error: "Contact introuvable" };
		}

		await db.delete(contacts).where(eq(contacts.id, id));
		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la suppression") };
	}
}
