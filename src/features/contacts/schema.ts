import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  companyId: z.string().uuid("L'entreprise sélectionnée n'est pas valide"),
  role: z.string().optional(),
  email: z.string().email("L'email n'est pas valide").optional().or(z.literal("")),
  phone: z.string().optional(),
  linkedin: z.string().url("L'URL LinkedIn n'est pas valide").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const updateContactSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  role: z.string().nullable().optional(),
  email: z.string().email("L'email n'est pas valide").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  linkedin: z.string().url("L'URL LinkedIn n'est pas valide").nullable().optional().or(z.literal("")),
  notes: z.string().nullable().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
