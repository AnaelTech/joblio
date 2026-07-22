import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
	id: uuid().defaultRandom().primaryKey(),

	name: varchar({ length: 255 }).notNull(),

	website: text(),

	linkedin: text(),

	industry: varchar({ length: 255 }),

	size: varchar({ length: 100 }),

	location: varchar({ length: 255 }),

	logo: text(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
