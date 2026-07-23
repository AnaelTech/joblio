import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { applications } from "./applications";
import { interviews } from "./interviews";
import { users } from "./users";

export const notifications = pgTable(
	"notifications",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),

		type: varchar("type", { length: 50 }).notNull(),

		title: text("title").notNull(),

		message: text("message"),

		link: text("link"),

		read: boolean("read").default(false).notNull(),

		applicationId: uuid("application_id").references(() => applications.id, {
			onDelete: "cascade",
		}),

		interviewId: uuid("interview_id").references(() => interviews.id, {
			onDelete: "cascade",
		}),

		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("notifications_user_idx").on(table.userId),
		index("notifications_read_idx").on(table.read),
		index("notifications_created_at_idx").on(table.createdAt),
	],
);
