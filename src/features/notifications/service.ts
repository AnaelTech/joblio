import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { notifications } from "@/db/schema/notifications";

export interface CreateNotificationInput {
	userId: string;
	type: string;
	title: string;
	message?: string;
	link?: string;
	applicationId?: string;
	interviewId?: string;
}

export interface NotificationRow {
	id: string;
	userId: string;
	type: string;
	title: string;
	message: string | null;
	link: string | null;
	read: boolean;
	applicationId: string | null;
	interviewId: string | null;
	createdAt: Date;
}

export async function createNotification(
	input: CreateNotificationInput,
): Promise<NotificationRow> {
	const [row] = await db
		.insert(notifications)
		.values({
			userId: input.userId,
			type: input.type,
			title: input.title,
			message: input.message ?? null,
			link: input.link ?? null,
			applicationId: input.applicationId ?? null,
			interviewId: input.interviewId ?? null,
		})
		.returning();
	return row;
}

export async function getNotifications(
	userId: string,
	options?: { read?: boolean; limit?: number },
): Promise<NotificationRow[]> {
	const conditions = [eq(notifications.userId, userId)];

	if (options?.read !== undefined) {
		conditions.push(eq(notifications.read, options.read));
	}

	const query = db
		.select()
		.from(notifications)
		.where(and(...conditions))
		.orderBy(desc(notifications.createdAt));

	if (options?.limit) {
		query.limit(options.limit);
	}

	return query;
}

export async function getUnreadCount(userId: string): Promise<number> {
	const rows = await db
		.select({ id: notifications.id })
		.from(notifications)
		.where(
			and(eq(notifications.userId, userId), eq(notifications.read, false)),
		);
	return rows.length;
}

export async function markAsRead(id: string): Promise<void> {
	await db
		.update(notifications)
		.set({ read: true })
		.where(eq(notifications.id, id));
}

export async function markAllAsRead(userId: string): Promise<void> {
	await db
		.update(notifications)
		.set({ read: true })
		.where(
			and(eq(notifications.userId, userId), eq(notifications.read, false)),
		);
}
