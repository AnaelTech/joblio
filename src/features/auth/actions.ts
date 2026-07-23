import { db } from "@/db/client";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

function getErrorMessage(e: unknown, fallback: string): string {
	return e instanceof Error ? e.message : fallback;
}

export async function hasUsers(): Promise<boolean> {
	const rows = await db.select({ id: users.id }).from(users).limit(1);
	return rows.length > 0;
}

export async function setup(
	name: string,
	email: string,
	password: string,
): Promise<
	{ success: true; userId: string } | { success: false; error: string }
> {
	try {
		const existing = await hasUsers();
		if (existing) {
			return { success: false, error: "Un administrateur existe déjà" };
		}

		const passwordHash = await bcrypt.hash(password, 12);

		const [user] = await db
			.insert(users)
			.values({ name, email, passwordHash })
			.returning({ id: users.id });

		return { success: true, userId: user.id };
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la création du compte"),
		};
	}
}

export async function login(
	email: string,
	password: string,
): Promise<
	| {
			success: true;
			sessionToken: string;
			user: { id: string; name: string; email: string };
	  }
	| { success: false; error: string }
> {
	try {
		const [user] = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				passwordHash: users.passwordHash,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			return { success: false, error: "Email ou mot de passe incorrect" };
		}

		const valid = await bcrypt.compare(password, user.passwordHash);
		if (!valid) {
			return { success: false, error: "Email ou mot de passe incorrect" };
		}

		const sessionToken = randomUUID();
		await db.update(users).set({ sessionToken }).where(eq(users.id, user.id));

		return {
			success: true,
			sessionToken,
			user: { id: user.id, name: user.name, email: user.email },
		};
	} catch (e) {
		return {
			success: false,
			error: getErrorMessage(e, "Erreur lors de la connexion"),
		};
	}
}

export async function getSession(
	token: string | undefined,
): Promise<{ id: string; name: string; email: string } | null> {
	if (!token) return null;

	const [user] = await db
		.select({ id: users.id, name: users.name, email: users.email })
		.from(users)
		.where(eq(users.sessionToken, token))
		.limit(1);

	return user ?? null;
}

export async function logout(token: string): Promise<void> {
	await db
		.update(users)
		.set({ sessionToken: null })
		.where(eq(users.sessionToken, token));
}
