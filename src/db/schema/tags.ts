import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
	id: uuid().defaultRandom().primaryKey(),

	name: varchar({ length: 100 }).notNull().unique(),

	color: varchar({ length: 30 }),
});
