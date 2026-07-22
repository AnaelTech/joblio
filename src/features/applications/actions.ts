import { db } from "@/db/client";
import { applications } from "@/db/schema/applications";
import { companies } from "@/db/schema/companies";
import { applicationTags } from "@/db/schema/application-tags";
import { activities } from "@/db/schema/activities";
import {
	createApplicationSchema,
	updateApplicationSchema,
	type CreateApplicationInput,
	type UpdateApplicationInput,
} from "./schema";
import { eq, ilike, and } from "drizzle-orm";

async function findOrCreateCompany(name: string): Promise<string> {
	const existing = await db
		.select({ id: companies.id })
		.from(companies)
		.where(ilike(companies.name, name))
		.limit(1);

	if (existing.length > 0) return existing[0].id;

	const [created] = await db
		.insert(companies)
		.values({ name })
		.returning({ id: companies.id });

	return created.id;
}

async function recordActivity(
	applicationId: string,
	action: string,
	description: string,
) {
	await db.insert(activities).values({
		applicationId,
		action,
		description,
	});
}

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function createApplication(
	input: CreateApplicationInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
	try {
		const parsed = createApplicationSchema.parse(input);
		const companyId = await findOrCreateCompany(parsed.companyName);

		const [application] = await db
			.insert(applications)
			.values({
				companyId,
				title: parsed.title,
				source: parsed.source,
				status: parsed.status,
				priority: parsed.priority,
				location: parsed.location ?? null,
				remoteType: parsed.remoteType ?? null,
				notes: parsed.notes ?? null,
			})
			.returning({ id: applications.id });

		if (parsed.tagIds && parsed.tagIds.length > 0) {
			await db.insert(applicationTags).values(
				parsed.tagIds.map((tagId) => ({
					applicationId: application.id,
					tagId,
				})),
			);
		}

		await recordActivity(
			application.id,
			"created",
			`Candidature créée pour ${parsed.title}`,
		);

		return { success: true, id: application.id };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la création") };
	}
}

export async function updateApplication(
	id: string,
	input: UpdateApplicationInput,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const parsed = updateApplicationSchema.parse(input);
		const changed: string[] = [];

		if (parsed.status) changed.push(`statut → ${parsed.status}`);
		if (parsed.priority) changed.push(`priorité → ${parsed.priority}`);

		await db
			.update(applications)
			.set({ ...parsed, updatedAt: new Date() })
			.where(eq(applications.id, id));

		if (changed.length > 0) {
			await recordActivity(id, "updated", changed.join(", "));
		}

		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la modification") };
	}
}

export async function deleteApplication(
	id: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const [app] = await db
			.select({ title: applications.title })
			.from(applications)
			.where(eq(applications.id, id))
			.limit(1);

		if (app) {
			await recordActivity(
				id,
				"deleted",
				`Candidature supprimée : ${app.title}`,
			);

			await db.delete(applications).where(eq(applications.id, id));
		}

		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de la suppression") };
	}
}

export async function addApplicationTag(
	applicationId: string,
	tagId: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const existing = await db
			.select()
			.from(applicationTags)
			.where(
				and(
					eq(applicationTags.applicationId, applicationId),
					eq(applicationTags.tagId, tagId),
				),
			)
			.limit(1);

		if (existing.length === 0) {
			await db.insert(applicationTags).values({
				applicationId,
				tagId,
			});
		}

		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors de l'ajout du tag") };
	}
}

export async function removeApplicationTag(
	applicationId: string,
	tagId: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db
			.delete(applicationTags)
			.where(
				and(
					eq(applicationTags.applicationId, applicationId),
					eq(applicationTags.tagId, tagId),
				),
			);

		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e, "Erreur lors du retrait du tag") };
	}
}
