import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable(
	"sessions",
	{
		id: uuid().defaultRandom().primaryKey(),

		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),

		token: varchar({ length: 255 }).notNull().unique(),

		createdAt: timestamp("created_at").defaultNow().notNull(),

		expiresAt: timestamp("expires_at"),
	},
	(table) => [index("sessions_user_id_idx").on(table.userId)],
);
