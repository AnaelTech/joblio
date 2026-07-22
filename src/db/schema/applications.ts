import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import {
	applicationStatusEnum,
	priorityEnum,
	remoteTypeEnum,
	sourceEnum,
} from "./enums.ts";
import { companies } from "./companies";
import { contacts } from "./contacts";

export const applications = pgTable(
	"applications",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		companyId: uuid("company_id")
			.references(() => companies.id, {
				onDelete: "cascade",
			})
			.notNull(),

		contactId: uuid("contact_id").references(() => contacts.id, {
			onDelete: "set null",
		}),

		title: varchar("title", {
			length: 255,
		}).notNull(),

		source: sourceEnum("source").notNull(),

		sourceUrl: text("source_url"),

		status: applicationStatusEnum("status").default("draft").notNull(),

		priority: priorityEnum("priority").default("medium").notNull(),

		favorite: boolean("favorite").default(false).notNull(),

		salaryMin: integer("salary_min"),

		salaryMax: integer("salary_max"),

		currency: varchar("currency", {
			length: 3,
		})
			.default("EUR")
			.notNull(),

		remoteType: remoteTypeEnum("remote_type"),

		location: varchar("location", {
			length: 255,
		}),

		applicationDate: timestamp("application_date"),

		followUpDate: timestamp("follow_up_date"),

		responseDate: timestamp("response_date"),

		notes: text("notes"),

		createdAt: timestamp("created_at").defaultNow().notNull(),

		updatedAt: timestamp("updated_at").defaultNow().notNull(),

		archivedAt: timestamp("archived_at"),
	},
	(table) => [
		index("applications_company_idx").on(table.companyId),

		index("applications_contact_idx").on(table.contactId),

		index("applications_status_idx").on(table.status),

		index("applications_priority_idx").on(table.priority),

		index("applications_follow_up_idx").on(table.followUpDate),

		index("applications_application_date_idx").on(table.applicationDate),

		index("applications_favorite_idx").on(table.favorite),
	],
);
