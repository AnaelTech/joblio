import { db } from "@/db/client";
import { companies } from "@/db/schema/companies";
import { type CreateCompanyInput, updateCompanySchema } from "./schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

function getErrorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export async function createCompany(
  userId: string,
  input: CreateCompanyInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const [company] = await db
      .insert(companies)
      .values({
        userId,
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
    return {
      success: false,
      error: getErrorMessage(e, "Erreur lors de la création"),
    };
  }
}

export async function updateCompany(
  id: string,
  userId: string,
  input: Partial<CreateCompanyInput>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = updateCompanySchema.parse(input);

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)))
      .limit(1);

    if (!company) {
      return { success: false, error: "Entreprise introuvable" };
    }

    await db
      .update(companies)
      .set({
        name: parsed.name,
        industry: parsed.industry ?? null,
        size: parsed.size ?? null,
        location: parsed.location ?? null,
        website: parsed.website ?? null,
        linkedin: parsed.linkedin ?? null,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id));

    return { success: true };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return {
        success: false,
        error: e.errors.map((err) => err.message).join(", "),
      };
    }
    return {
      success: false,
      error: getErrorMessage(e, "Erreur lors de la modification"),
    };
  }
}

export async function deleteCompany(
  id: string,
  userId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.userId, userId)))
      .limit(1);

    if (!company) {
      return { success: false, error: "Entreprise introuvable" };
    }

    await db.delete(companies).where(eq(companies.id, id));
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: getErrorMessage(e, "Erreur lors de la suppression"),
    };
  }
}
