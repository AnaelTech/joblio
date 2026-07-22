import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema/users";

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function updateProfile(
	userId: string,
	data: { name?: string; email?: string },
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const updateData: Record<string, unknown> = {};
		if (data.name !== undefined) updateData.name = data.name;
		if (data.email !== undefined) updateData.email = data.email;

		if (Object.keys(updateData).length === 0) {
			return { success: true };
		}

		await db.update(users).set(updateData).where(eq(users.id, userId));

		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la mise à jour du profil"),
		};
	}
}

export async function changePassword(
	userId: string,
	currentPassword: string,
	newPassword: string,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const [user] = await db
			.select({ passwordHash: users.passwordHash })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			return { success: false, error: "Utilisateur introuvable" };
		}

		const valid = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!valid) {
			return { success: false, error: "Mot de passe actuel incorrect" };
		}

		const passwordHash = await bcrypt.hash(newPassword, 12);
		await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors du changement de mot de passe"),
		};
	}
}

export async function updateNotificationPreferences(
	userId: string,
	data: { notifyFollowUp?: boolean; notifyInterview?: boolean },
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const updateData: Record<string, unknown> = {};
		if (data.notifyFollowUp !== undefined)
			updateData.notifyFollowUp = data.notifyFollowUp;
		if (data.notifyInterview !== undefined)
			updateData.notifyInterview = data.notifyInterview;

		if (Object.keys(updateData).length === 0) {
			return { success: true };
		}

		await db.update(users).set(updateData).where(eq(users.id, userId));

		return { success: true };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(
				e,
				"Erreur lors de la mise à jour des préférences",
			),
		};
	}
}
