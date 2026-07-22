import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { documentTypeEnum } from "./enums";

import { applications } from "./applications";

export const documents = pgTable(
	"documents",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		applicationId: uuid("application_id")
			.references(() => applications.id, {
				onDelete: "cascade",
			})
			.notNull(),

		type: documentTypeEnum("type").notNull(),

		filename: varchar("filename", {
			length: 255,
		}).notNull(),

		storagePath: text("storage_path").notNull(),

		mimeType: varchar("mime_type", {
			length: 100,
		}),

		size: integer("size_bytes"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [index("documents_application_idx").on(table.applicationId)],
);
