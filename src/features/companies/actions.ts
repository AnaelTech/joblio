import { db } from "@/db/client";
import { companies } from "@/db/schema/companies";
import { type CreateCompanyInput } from "./schema";
import { eq } from "drizzle-orm";

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function createCompany(
	input: CreateCompanyInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
	try {
		const [company] = await db
			.insert(companies)
			.values({
				name: input.name,
				industry: input.industry ?? null,
				size: input.size ?? null,
				location: input.location ?? null,
				website: input.website || null,
				linkedin: input.linkedin || null,
			})
			.returning({ id: companies.id });

		return { success: true, id: company.id };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la création") };
	}
}

export async function updateCompany(
	id: string,
	input: Partial<CreateCompanyInput>,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db
			.update(companies)
			.set({
				name: input.name,
				industry: input.industry ?? null,
				size: input.size ?? null,
				location: input.location ?? null,
				website: input.website ?? null,
				linkedin: input.linkedin ?? null,
				updatedAt: new Date(),
			})
			.where(eq(companies.id, id));

		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la modification") };
	}
}

export async function deleteCompany(
	id: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db.delete(companies).where(eq(companies.id, id));
		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la suppression") };
	}
}
