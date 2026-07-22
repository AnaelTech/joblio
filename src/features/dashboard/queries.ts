import { db } from "@/db/client";
import { applications } from "@/db/schema/applications";
import { activities } from "@/db/schema/activities";
import { interviews } from "@/db/schema/interviews";
import { companies } from "@/db/schema/companies";
import {
	and,
	count,
	desc,
	eq,
	gte,
	inArray,
	isNotNull,
	isNull,
	lte,
} from "drizzle-orm";
import { addDays } from "date-fns";

export interface DashboardStats {
	totalApplications: number;
	activeApplications: number;
	upcomingInterviews: number;
	offersReceived: number;
}

export interface StatusCount {
	status: string;
	count: number;
}

export interface ActivityItem {
	id: string;
	action: string;
	description: string | null;
	createdAt: Date;
	applicationTitle: string;
	companyName: string;
}

export interface FollowUpItem {
	id: string;
	title: string;
	companyName: string;
	followUpDate: Date;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
	try {
		const [total] = await db.select({ count: count() }).from(applications);

		const [active] = await db
			.select({ count: count() })
			.from(applications)
			.where(
				and(
					isNull(applications.archivedAt),
					inArray(applications.status, ["applied", "in_progress"]),
				),
			);

		const [offers] = await db
			.select({ count: count() })
			.from(applications)
			.where(eq(applications.status, "offer"));

		const now = new Date();
		const sevenDays = addDays(now, 7);

		const [interviewsCount] = await db
			.select({ count: count() })
			.from(interviews)
			.where(
				and(
					gte(interviews.scheduledAt, now),
					lte(interviews.scheduledAt, sevenDays),
				),
			);

		return {
			totalApplications: total.count,
			activeApplications: active.count,
			upcomingInterviews: interviewsCount.count,
			offersReceived: offers.count,
		};
	} catch {
		return null;
	}
}

export async function getStatusBreakdown(): Promise<StatusCount[]> {
	try {
		return await db
			.select({
				status: applications.status,
				count: count(),
			})
			.from(applications)
			.groupBy(applications.status)
			.orderBy(desc(count()));
	} catch {
		return [];
	}
}

export async function getRecentActivities(limit = 10): Promise<ActivityItem[]> {
	try {
		return await db
			.select({
				id: activities.id,
				action: activities.action,
				description: activities.description,
				createdAt: activities.createdAt,
				applicationTitle: applications.title,
				companyName: companies.name,
			})
			.from(activities)
			.innerJoin(applications, eq(activities.applicationId, applications.id))
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.orderBy(desc(activities.createdAt))
			.limit(limit);
	} catch {
		return [];
	}
}

export async function getUpcomingFollowUps(days = 7): Promise<FollowUpItem[]> {
	try {
		const now = new Date();
		const future = addDays(now, days);

		return await db
			.select({
				id: applications.id,
				title: applications.title,
				companyName: companies.name,
				followUpDate: applications.followUpDate,
			})
			.from(applications)
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(
				and(
					isNotNull(applications.followUpDate),
					gte(applications.followUpDate, now),
					lte(applications.followUpDate, future),
				),
			)
			.orderBy(applications.followUpDate);
	} catch {
		return [];
	}
}
