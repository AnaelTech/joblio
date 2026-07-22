import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { applications } from "./applications";
import { tags } from "./tags";

export const applicationTags = pgTable(
	"application_tags",
	{
		applicationId: uuid("application_id")
			.references(() => applications.id, {
				onDelete: "cascade",
			})
			.notNull(),

		tagId: uuid("tag_id")
			.references(() => tags.id, {
				onDelete: "cascade",
			})
			.notNull(),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.applicationId, table.tagId],
		}),
	}),
);
