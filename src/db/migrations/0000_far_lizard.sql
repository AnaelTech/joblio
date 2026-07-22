CREATE TYPE "public"."activity_action" AS ENUM('created', 'updated', 'status_changed', 'follow_up', 'note_added', 'document_added', 'document_removed', 'interview_scheduled', 'interview_completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('draft', 'saved', 'applied', 'in_progress', 'offer', 'accepted', 'rejected', 'withdrawn', 'ghosted', 'archived');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('resume', 'cover_letter', 'portfolio', 'certificate', 'contract', 'offer_letter', 'other');--> statement-breakpoint
CREATE TYPE "public"."interview_result" AS ENUM('pending', 'passed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('phone_screen', 'hr', 'technical', 'manager', 'final', 'other');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."remote_type" AS ENUM('onsite', 'hybrid', 'remote');--> statement-breakpoint
CREATE TYPE "public"."application_source" AS ENUM('linkedin', 'welcome_to_the_jungle', 'indeed', 'apec', 'hellowork', 'company_website', 'referral', 'recruiter', 'job_fair', 'other');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"action" "activity_action" NOT NULL,
	"field" text,
	"old_value" text,
	"new_value" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_tags" (
	"application_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "application_tags_application_id_tag_id_pk" PRIMARY KEY("application_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"contact_id" uuid,
	"title" varchar(255) NOT NULL,
	"source" "application_source" NOT NULL,
	"source_url" text,
	"status" "application_status" DEFAULT 'draft' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"remote_type" "remote_type",
	"location" varchar(255),
	"application_date" timestamp,
	"follow_up_date" timestamp,
	"response_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"website" text,
	"linkedin" text,
	"industry" varchar(255),
	"size" varchar(100),
	"location" varchar(255),
	"logo" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"linkedin" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "document_type" NOT NULL,
	"filename" varchar(255) NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" varchar(100),
	"size_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"type" "interview_type" NOT NULL,
	"scheduled_at" timestamp,
	"duration_minutes" integer,
	"result" "interview_result" DEFAULT 'pending' NOT NULL,
	"interviewer" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(30),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_tags" ADD CONSTRAINT "application_tags_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_tags" ADD CONSTRAINT "application_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_application_idx" ON "activities" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "activities_date_idx" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "applications_company_idx" ON "applications" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "applications_contact_idx" ON "applications" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_priority_idx" ON "applications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "applications_follow_up_idx" ON "applications" USING btree ("follow_up_date");--> statement-breakpoint
CREATE INDEX "applications_application_date_idx" ON "applications" USING btree ("application_date");--> statement-breakpoint
CREATE INDEX "applications_favorite_idx" ON "applications" USING btree ("favorite");--> statement-breakpoint
CREATE INDEX "documents_application_idx" ON "documents" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interviews_application_idx" ON "interviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interviews_date_idx" ON "interviews" USING btree ("scheduled_at");