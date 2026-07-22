import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),

	name: varchar({ length: 255 }).notNull(),

	email: varchar({ length: 255 }).notNull().unique(),

	passwordHash: varchar("password_hash", {
		length: 255,
	}).notNull(),

	sessionToken: varchar("session_token", {
		length: 255,
	}),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
