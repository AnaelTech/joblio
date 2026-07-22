import { z } from "zod";

export const createInterviewSchema = z.object({
  applicationId: z.string().uuid("La candidature sélectionnée n'est pas valide"),
  type: z.enum(["phone_screen", "hr", "technical", "manager", "final", "other"]),
  scheduledAt: z.string().optional(),
  duration: z.coerce.number().int().positive().optional(),
  interviewer: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInterviewSchema = z.object({
  type: z.enum(["phone_screen", "hr", "technical", "manager", "final", "other"]).optional(),
  scheduledAt: z.string().nullable().optional(),
  duration: z.coerce.number().int().positive().nullable().optional(),
  interviewer: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  phone_screen: "Phone screen",
  hr: "RH",
  technical: "Technique",
  manager: "Manager",
  final: "Final",
  other: "Autre",
};

export const INTERVIEW_RESULT_LABELS: Record<string, string> = {
  pending: "À venir",
  passed: "Réussi",
  failed: "Échoué",
  cancelled: "Annulé",
};
