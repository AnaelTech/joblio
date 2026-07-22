import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { activityActionEnum } from "./enums";

import { applications } from "./applications";

export const activities = pgTable(
	"activities",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		applicationId: uuid("application_id")
			.references(() => applications.id, {
				onDelete: "cascade",
			})
			.notNull(),

		action: activityActionEnum("action").notNull(),

		field: text("field"),

		oldValue: text("old_value"),

		newValue: text("new_value"),

		description: text("description"),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("activities_application_idx").on(table.applicationId),

		index("activities_date_idx").on(table.createdAt),
	],
);
