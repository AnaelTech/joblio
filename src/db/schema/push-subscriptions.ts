import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const pushSubscriptions = pgTable("push_subscriptions", {
	id: uuid("id").defaultRandom().primaryKey(),

	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),

	endpoint: text("endpoint").notNull(),
	p256dh: text("p256dh").notNull(),
	auth: text("auth").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});
