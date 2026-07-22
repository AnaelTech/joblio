import { db } from "@/db/client";
import { tags } from "@/db/schema/tags";
import { type CreateTagInput } from "./schema";

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
