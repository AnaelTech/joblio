import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { activities } from "@/db/schema/activities";
import { interviews } from "@/db/schema/interviews";
import { users } from "@/db/schema/users";
import { createNotification } from "@/features/notifications/service";
import { type CreateInterviewInput, updateInterviewSchema } from "./schema";

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function createInterview(
	userId: string,
	input: CreateInterviewInput,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
	try {
		const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

		const [interview] = await db
			.insert(interviews)
			.values({
				applicationId: input.applicationId,
				type: input.type,
				scheduledAt,
				duration: input.duration ?? null,
				interviewer: input.interviewer ?? null,
				notes: input.notes ?? null,
			})
			.returning({ id: interviews.id });

		await db.insert(activities).values({
			applicationId: input.applicationId,
			action: "interview_scheduled",
			description: scheduledAt
				? `Entretien ${input.type} planifié le ${scheduledAt.toLocaleDateString("fr")}`
				: `Entretien ${input.type} ajouté`,
		});

		if (scheduledAt) {
			const [user] = await db
				.select({ notifyInterview: users.notifyInterview })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);
			if (user?.notifyInterview) {
				await createNotification({
					userId,
					type: "interview",
					title: "Entretien planifié",
					message: `Entretien ${input.type} prévu le ${format(scheduledAt, "dd MMM yyyy 'à' HH:mm", { locale: fr })}`,
					link: `/applications/${input.applicationId}`,
					applicationId: input.applicationId,
					interviewId: interview.id,
				});
			}
		}

		return { success: true, id: interview.id };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la création"),
		};
	}
}

export async function updateInterview(
	id: string,
	input: Record<string, unknown>,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const parsed = updateInterviewSchema.parse(input);
		const data: Record<string, unknown> = {
			type: parsed.type,
			interviewer: parsed.interviewer ?? null,
			duration: parsed.duration ?? null,
			notes: parsed.notes ?? null,
			updatedAt: new Date(),
		};

		if (parsed.scheduledAt) {
			data.scheduledAt = new Date(parsed.scheduledAt);
		} else if (parsed.scheduledAt === null) {
			data.scheduledAt = null;
		}

		if (parsed.result) {
			data.result = parsed.result;
		}

		await db.update(interviews).set(data).where(eq(interviews.id, id));

		return { success: true };
	} catch (e) {
		if (e instanceof z.ZodError) {
			return {
				success: false,
				error: e.errors.map((err) => err.message).join(", "),
			};
		}
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la modification"),
		};
	}
}

export async function deleteInterview(
	id: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		await db.delete(interviews).where(eq(interviews.id, id));
		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la suppression"),
		};
	}
}
