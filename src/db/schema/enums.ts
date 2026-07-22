import { pgEnum } from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
	"draft",
	"saved",
	"applied",
	"in_progress",
	"offer",
	"accepted",
	"rejected",
	"withdrawn",
	"ghosted",
	"archived",
]);

export const sourceEnum = pgEnum("application_source", [
	"linkedin",
	"welcome_to_the_jungle",
	"indeed",
	"apec",
	"hellowork",
	"company_website",
	"referral",
	"recruiter",
	"job_fair",
	"other",
]);

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const remoteTypeEnum = pgEnum("remote_type", [
	"onsite",
	"hybrid",
	"remote",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
	"phone_screen",
	"hr",
	"technical",
	"manager",
	"final",
	"other",
]);

export const interviewResultEnum = pgEnum("interview_result", [
	"pending",
	"passed",
	"failed",
	"cancelled",
]);

export const documentTypeEnum = pgEnum("document_type", [
	"resume",
	"cover_letter",
	"portfolio",
	"certificate",
	"contract",
	"offer_letter",
	"other",
]);

export const activityActionEnum = pgEnum("activity_action", [
	"created",
	"updated",
	"deleted",
	"status_changed",
	"follow_up",
	"note_added",
	"document_added",
	"document_removed",
	"interview_scheduled",
	"interview_completed",
	"archived",
]);
