import { relations } from "drizzle-orm";

import { users } from "./schema/users";
import { companies } from "./schema/companies";
import { contacts } from "./schema/contacts";
import { applications } from "./schema/applications";
import { interviews } from "./schema/interviews";
import { documents } from "./schema/documents";
import { activities } from "./schema/activities";
import { tags } from "./schema/tags";
import { applicationTags } from "./schema/application-tags";

// ======================
// Users
// ======================

export const usersRelations = relations(users, ({ many }) => ({
	companies: many(companies),
	applications: many(applications),
}));

// ======================
// Companies
// ======================

export const companiesRelations = relations(companies, ({ one, many }) => ({
	user: one(users, {
		fields: [companies.userId],
		references: [users.id],
	}),

	contacts: many(contacts),

	applications: many(applications),
}));

// ======================
// Contacts
// ======================

export const contactsRelations = relations(contacts, ({ one, many }) => ({
	company: one(companies, {
		fields: [contacts.companyId],
		references: [companies.id],
	}),

	applications: many(applications),
}));

// ======================
// Applications
// ======================

export const applicationsRelations = relations(
	applications,
	({ one, many }) => ({
		user: one(users, {
			fields: [applications.userId],
			references: [users.id],
		}),

		company: one(companies, {
			fields: [applications.companyId],
			references: [companies.id],
		}),

		contact: one(contacts, {
			fields: [applications.contactId],
			references: [contacts.id],
		}),

		interviews: many(interviews),

		documents: many(documents),

		activities: many(activities),

		applicationTags: many(applicationTags),
	}),
);

// ======================
// Interviews
// ======================

export const interviewsRelations = relations(interviews, ({ one }) => ({
	application: one(applications, {
		fields: [interviews.applicationId],
		references: [applications.id],
	}),
}));

// ======================
// Documents
// ======================

export const documentsRelations = relations(documents, ({ one }) => ({
	application: one(applications, {
		fields: [documents.applicationId],
		references: [applications.id],
	}),
}));

// ======================
// Activities
// ======================

export const activitiesRelations = relations(activities, ({ one }) => ({
	application: one(applications, {
		fields: [activities.applicationId],
		references: [applications.id],
	}),
}));

// ======================
// Tags
// ======================

export const tagsRelations = relations(tags, ({ many }) => ({
	applicationTags: many(applicationTags),
}));

// ======================
// Application Tags
// ======================

export const applicationTagsRelations = relations(
	applicationTags,
	({ one }) => ({
		application: one(applications, {
			fields: [applicationTags.applicationId],
			references: [applications.id],
		}),

		tag: one(tags, {
			fields: [applicationTags.tagId],
			references: [tags.id],
		}),
	}),
);
