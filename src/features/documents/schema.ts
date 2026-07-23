import { z } from "zod";

export const DOCUMENT_TYPES = [
	"resume",
	"cover_letter",
	"portfolio",
	"certificate",
	"contract",
	"offer_letter",
	"other",
] as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
	resume: "CV",
	cover_letter: "Lettre de motivation",
	portfolio: "Portfolio",
	certificate: "Certificat",
	contract: "Contrat",
	offer_letter: "Promesse d'embauche",
	other: "Autre",
};

export const DOCUMENT_TYPE_ICONS: Record<string, string> = {
	resume: "FileText",
	cover_letter: "FileText",
	portfolio: "FolderOpen",
	certificate: "Award",
	contract: "FileSignature",
	offer_letter: "Mail",
	other: "File",
};
