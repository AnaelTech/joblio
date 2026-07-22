import { z } from "zod";

export const createApplicationSchema = z.object({
	companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
	title: z.string().min(1, "Le titre du poste est requis"),
	source: z.enum([
		"linkedin",
		"welcome_to_the_jungle",
		"indeed",
		"apec",
		"hellowork",
		"company_website",
		"referral",
		"recruiter",
		"job_fair",
		"other",
	]),
	status: z
		.enum([
			"draft",
			"saved",
			"applied",
			"in_progress",
			"offer",
			"accepted",
			"rejected",
			"withdrawn",
			"ghosted",
			"archived",
		])
		.default("applied"),
	priority: z.enum(["low", "medium", "high"]).default("medium"),
	location: z.string().optional(),
	remoteType: z.enum(["onsite", "hybrid", "remote"]).optional(),
	notes: z.string().optional(),
	tagIds: z
		.preprocess((v) => {
			if (typeof v === "string") {
				try {
					return JSON.parse(v);
				} catch {
					return [];
				}
			}
			return v;
		}, z.array(z.string().uuid()).optional()),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = z.object({
	status: z
		.enum([
			"draft",
			"saved",
			"applied",
			"in_progress",
			"offer",
			"accepted",
			"rejected",
			"withdrawn",
			"ghosted",
			"archived",
		])
		.optional(),
	priority: z.enum(["low", "medium", "high"]).optional(),
	notes: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	remoteType: z.enum(["onsite", "hybrid", "remote"]).nullable().optional(),
});

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const SOURCE_LABELS: Record<string, string> = {
	linkedin: "LinkedIn",
	welcome_to_the_jungle: "Welcome to the Jungle",
	indeed: "Indeed",
	apec: "APEC",
	hellowork: "HelloWork",
	company_website: "Site web",
	referral: "Recommandation",
	recruiter: "Recruteur",
	job_fair: "Salon emploi",
	other: "Autre",
};

export const STATUS_LABELS: Record<string, string> = {
	draft: "Brouillon",
	saved: "Sauvegardée",
	applied: "Candidaté",
	in_progress: "En cours",
	offer: "Offre",
	accepted: "Acceptée",
	rejected: "Refusée",
	withdrawn: "Retirée",
	ghosted: "Sans réponse",
	archived: "Archivée",
};

export const PRIORITY_LABELS: Record<string, string> = {
	low: "Faible",
	medium: "Moyenne",
	high: "Haute",
};

export const REMOTE_LABELS: Record<string, string> = {
	onsite: "Sur site",
	hybrid: "Hybride",
	remote: "Distant",
};
