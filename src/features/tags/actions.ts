import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tags } from "@/db/schema/tags";
import type { CreateTagInput, UpdateTagInput } from "./schema";

export async function createTag(
	input: CreateTagInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
	try {
		const [tag] = await db
			.insert(tags)
			.values({
				name: input.name,
				color: input.color || null,
			})
			.returning({ id: tags.id });

		return { success: true, id: tag.id };
	} catch (e) {
		const message =
			e instanceof Error ? e.message : "Erreur lors de la création";
		return { success: false, error: message };
	}
}

export async function updateTag(
	id: string,
	input: UpdateTagInput,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const updateData: Record<string, unknown> = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.color !== undefined) updateData.color = input.color;

		await db.update(tags).set(updateData).where(eq(tags.id, id));

		return { success: true };
	} catch (e) {
		const message =
			e instanceof Error ? e.message : "Erreur lors de la modification";
		return { success: false, error: message };
	}
}

export async function deleteTag(
	id: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db.delete(tags).where(eq(tags.id, id));
		return { success: true };
	} catch (e) {
		const message =
			e instanceof Error ? e.message : "Erreur lors de la suppression";
		return { success: false, error: message };
	}
}
