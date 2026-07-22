import { db } from "@/db/client";
import { applications } from "@/db/schema/applications";
import { companies } from "@/db/schema/companies";
import { applicationTags } from "@/db/schema/application-tags";
import { tags } from "@/db/schema/tags";
import { and, desc, eq, ilike, ne, or, inArray, sql } from "drizzle-orm";

export interface ApplicationTag {
	id: string;
	name: string;
	color: string | null;
}

export interface ApplicationRow {
	id: string;
	title: string;
	companyName: string;
	companyLogo: string | null;
	status: string;
	priority: string;
	favorite: boolean;
	location: string | null;
	remoteType: string | null;
	sourceUrl: string | null;
	notes: string | null;
	applicationDate: Date | null;
	followUpDate: Date | null;
	salaryMin: number | null;
	salaryMax: number | null;
	currency: string;
	createdAt: Date;
	tags: ApplicationTag[];
}

async function getTagsForApplications(
	applicationIds: string[],
): Promise<Map<string, ApplicationTag[]>> {
	if (applicationIds.length === 0) return new Map();

	const rows = await db
		.select({
			applicationId: applicationTags.applicationId,
			tagId: tags.id,
			tagName: tags.name,
			tagColor: tags.color,
		})
		.from(applicationTags)
		.innerJoin(tags, eq(applicationTags.tagId, tags.id))
		.where(inArray(applicationTags.applicationId, applicationIds));

	const map = new Map<string, ApplicationTag[]>();
	for (const row of rows) {
		const existing = map.get(row.applicationId) ?? [];
		existing.push({ id: row.tagId, name: row.tagName, color: row.tagColor });
		map.set(row.applicationId, existing);
	}
	return map;
}

export async function getApplications(params?: {
	userId?: string;
	search?: string;
	status?: string;
	priority?: string;
	archived?: string;
}): Promise<ApplicationRow[]> {
	try {
		const conditions = [];

		if (params?.userId) {
			conditions.push(eq(applications.userId, params.userId));
		}

		if (params?.archived === "true") {
			conditions.push(eq(applications.status, "archived"));
		} else {
			conditions.push(ne(applications.status, "archived"));
		}

		if (params?.search) {
			conditions.push(
				or(
					ilike(applications.title, `%${params.search}%`),
					ilike(companies.name, `%${params.search}%`),
				),
			);
		}

		if (params?.status && params?.archived !== "true") {
			conditions.push(eq(applications.status, params.status));
		}

		if (params?.priority) {
			conditions.push(eq(applications.priority, params.priority));
		}

		const rows = await db
			.select({
				id: applications.id,
				title: applications.title,
				companyName: companies.name,
				companyLogo: companies.logo,
				status: applications.status,
				priority: applications.priority,
				favorite: applications.favorite,
				location: applications.location,
				remoteType: applications.remoteType,
				sourceUrl: applications.sourceUrl,
				notes: applications.notes,
				applicationDate: applications.applicationDate,
				followUpDate: applications.followUpDate,
				salaryMin: applications.salaryMin,
				salaryMax: applications.salaryMax,
				currency: applications.currency,
				createdAt: applications.createdAt,
			})
			.from(applications)
			.innerJoin(companies, eq(applications.companyId, companies.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(applications.createdAt));

		const ids = rows.map((r) => r.id);
		const tagsMap = await getTagsForApplications(ids);

		return rows.map((r) => ({
			...r,
			tags: tagsMap.get(r.id) ?? [],
		}));
	} catch {
		return [];
	}
}
