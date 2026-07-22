import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1, "Le nom du tag est requis"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "La couleur doit être un hexadécimal valide (#RRGGBB)").optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const TAG_COLORS = [
  { value: "", label: "Défaut" },
  { value: "#ef4444", label: "Rouge" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Jaune" },
  { value: "#22c55e", label: "Vert" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Bleu" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Rose" },
];
