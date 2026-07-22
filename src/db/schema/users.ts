import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),

	email: varchar({ length: 255 }).notNull().unique(),

	passwordHash: varchar("password_hash", {
		length: 255,
	}).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
