import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { activities } from "@/db/schema/activities";
import { applications } from "@/db/schema/applications";
import { companies } from "@/db/schema/companies";
import { interviews } from "@/db/schema/interviews";
import type { CalendarEvent } from "./types";

export async function getCalendarEvents(
	userId: string,
	startDate: Date,
	endDate: Date,
): Promise<CalendarEvent[]> {
	const events: CalendarEvent[] = [];

	const _dateFilter = (col: { gte: typeof gte; lte: typeof lte }) =>
		and(gte(col, startDate), lte(col, endDate));

	// 1. Interviews
	try {
		const interviewRows = await db
			.select({
				id: interviews.id,
				scheduledAt: interviews.scheduledAt,
				type: interviews.type,
				duration: interviews.duration,
				result: interviews.result,
				applicationId: interviews.applicationId,
				applicationTitle: applications.title,
				companyName: companies.name,
			})
			.from(interviews)
			.innerJoin(applications, eq(interviews.applicationId, applications.id))
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(
				and(
					eq(applications.userId, userId),
					gte(interviews.scheduledAt, startDate),
					lte(interviews.scheduledAt, endDate),
				),
			);

		for (const row of interviewRows) {
			if (!row.scheduledAt) continue;
			events.push({
				id: `interview-${row.id}`,
				date: row.scheduledAt,
				title: `Entretien ${row.applicationTitle}`,
				description: `${row.companyName}`,
				type: "interview",
				applicationId: row.applicationId,
				applicationTitle: row.applicationTitle,
				companyName: row.companyName,
				interviewType: row.type,
				duration: row.duration ?? undefined,
				result: row.result,
			});
		}
	} catch {
		// skip interviews on error
	}

	// 2. Application follow-up dates
	try {
		const followUpRows = await db
			.select({
				id: applications.id,
				followUpDate: applications.followUpDate,
				title: applications.title,
				companyName: companies.name,
			})
			.from(applications)
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(
				and(
					eq(applications.userId, userId),
					gte(applications.followUpDate, startDate),
					lte(applications.followUpDate, endDate),
				),
			);

		for (const row of followUpRows) {
			if (!row.followUpDate) continue;
			events.push({
				id: `followup-${row.id}`,
				date: row.followUpDate,
				title: `Relance : ${row.title}`,
				description: `${row.companyName}`,
				type: "follow_up",
				applicationId: row.id,
				applicationTitle: row.title,
				companyName: row.companyName,
			});
		}
	} catch {
		// skip
	}

	// 3. Application sent dates
	try {
		const sentRows = await db
			.select({
				id: applications.id,
				applicationDate: applications.applicationDate,
				title: applications.title,
				companyName: companies.name,
			})
			.from(applications)
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(
				and(
					eq(applications.userId, userId),
					gte(applications.applicationDate, startDate),
					lte(applications.applicationDate, endDate),
				),
			);

		for (const row of sentRows) {
			if (!row.applicationDate) continue;
			events.push({
				id: `sent-${row.id}`,
				date: row.applicationDate,
				title: `Candidature envoyée : ${row.title}`,
				description: `${row.companyName}`,
				type: "application_sent",
				applicationId: row.id,
				applicationTitle: row.title,
				companyName: row.companyName,
			});
		}
	} catch {
		// skip
	}

	// 4. Response dates
	try {
		const responseRows = await db
			.select({
				id: applications.id,
				responseDate: applications.responseDate,
				title: applications.title,
				companyName: companies.name,
			})
			.from(applications)
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(
				and(
					eq(applications.userId, userId),
					gte(applications.responseDate, startDate),
					lte(applications.responseDate, endDate),
				),
			);

		for (const row of responseRows) {
			if (!row.responseDate) continue;
			events.push({
				id: `response-${row.id}`,
				date: row.responseDate,
				title: `Réponse reçue : ${row.title}`,
				description: `${row.companyName}`,
				type: "response_received",
				applicationId: row.id,
				applicationTitle: row.title,
				companyName: row.companyName,
			});
		}
	} catch {
		// skip
	}

	// 5. Activities
	try {
		const activityRows = await db
			.select({
				id: activities.id,
				createdAt: activities.createdAt,
				action: activities.action,
				description: activities.description,
				applicationId: activities.applicationId,
				applicationTitle: applications.title,
				companyName: companies.name,
			})
			.from(activities)
			.innerJoin(applications, eq(activities.applicationId, applications.id))
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(
				and(
					eq(applications.userId, userId),
					gte(activities.createdAt, startDate),
					lte(activities.createdAt, endDate),
				),
			);

		for (const row of activityRows) {
			if (!row.createdAt || !row.action) continue;
			events.push({
				id: `activity-${row.id}`,
				date: row.createdAt,
				title: row.description ?? `Activité : ${row.applicationTitle}`,
				description: `${row.companyName}`,
				type: "activity",
				applicationId: row.applicationId,
				applicationTitle: row.applicationTitle,
				companyName: row.companyName,
				action: row.action ?? undefined,
			});
		}
	} catch {
		// skip
	}

	// Sort by date ascending
	events.sort((a, b) => a.date.getTime() - b.date.getTime());

	return events;
}
