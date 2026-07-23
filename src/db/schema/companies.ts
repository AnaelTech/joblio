import {
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const companies = pgTable(
	"companies",
	{
		id: uuid().defaultRandom().primaryKey(),

		userId: uuid("user_id")
			.references(() => users.id, {
				onDelete: "cascade",
			})
			.notNull(),

		name: varchar({ length: 255 }).notNull(),

		website: text(),

		linkedin: text(),

		industry: varchar({ length: 255 }),

		size: varchar({ length: 100 }),

		location: varchar({ length: 255 }),

		logo: text(),

		createdAt: timestamp("created_at").defaultNow().notNull(),

		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [index("companies_user_idx").on(table.userId)],
);
