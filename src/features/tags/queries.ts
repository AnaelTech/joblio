import { desc, ilike } from "drizzle-orm";
import { db } from "@/db/client";
import { tags } from "@/db/schema/tags";

export interface TagRow {
	id: string;
	name: string;
	color: string | null;
}

export async function getTags(search?: string): Promise<TagRow[]> {
	try {
		const conditions = [];

		if (search) {
			conditions.push(ilike(tags.name, `%${search}%`));
		}

		return await db
			.select()
			.from(tags)
			.where(
				conditions.length > 0 ? ilike(tags.name, `%${search}%`) : undefined,
			)
			.orderBy(desc(tags.name));
	} catch {
		return [];
	}
}
