import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

import { interviewResultEnum, interviewTypeEnum } from "./enums";

import { applications } from "./applications";

export const interviews = pgTable(
	"interviews",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		applicationId: uuid("application_id")
			.references(() => applications.id, {
				onDelete: "cascade",
			})
			.notNull(),

		type: interviewTypeEnum("type").notNull(),

		scheduledAt: timestamp("scheduled_at"),

		duration: integer("duration_minutes"),

		result: interviewResultEnum("result").default("pending").notNull(),

		interviewer: text("interviewer"),

		notes: text("notes"),

		createdAt: timestamp("created_at").defaultNow().notNull(),

		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("interviews_application_idx").on(table.applicationId),

		index("interviews_date_idx").on(table.scheduledAt),
	],
);
