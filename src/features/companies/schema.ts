import { z } from "zod";

export const createCompanySchema = z.object({
	name: z.string().min(1, "Le nom de l'entreprise est requis"),
	industry: z.string().optional(),
	size: z.string().optional(),
	location: z.string().optional(),
	website: z
		.string()
		.url("L'URL du site web n'est pas valide")
		.optional()
		.or(z.literal("")),
	linkedin: z
		.string()
		.url("L'URL LinkedIn n'est pas valide")
		.optional()
		.or(z.literal("")),
});

export const updateCompanySchema = z.object({
	name: z.string().min(1, "Le nom de l'entreprise est requis").optional(),
	industry: z.string().nullable().optional(),
	size: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	website: z.string().nullable().optional(),
	linkedin: z.string().nullable().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
