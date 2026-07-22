import {
	boolean,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

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

	notifyFollowUp: boolean("notify_follow_up").default(false).notNull(),

	notifyInterview: boolean("notify_interview").default(false).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
