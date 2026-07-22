import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { companies } from "./companies";

export const contacts = pgTable("contacts", {
	id: uuid().defaultRandom().primaryKey(),

	companyId: uuid("company_id")
		.references(() => companies.id, {
			onDelete: "cascade",
		})
		.notNull(),

	name: varchar({ length: 255 }).notNull(),

	role: varchar({ length: 255 }),

	email: varchar({ length: 255 }),

	phone: varchar({ length: 50 }),

	linkedin: text(),

	notes: text(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
