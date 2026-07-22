import { z } from "zod";

export const setupSchema = z.object({
	name: z.string().min(1, "Le nom est requis"),
	email: z.string().email("Email invalide"),
	password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const loginSchema = z.object({
	email: z.string().email("Email invalide"),
	password: z.string().min(1, "Le mot de passe est requis"),
});

export type SetupInput = z.infer<typeof setupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
