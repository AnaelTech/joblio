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

export const STATUS_COLORS: Record<string, string> = {
	draft: "bg-muted text-muted-foreground",
	saved: "bg-muted text-muted-foreground",
	applied: "bg-blue-500/10 text-blue-600",
	in_progress: "bg-amber-500/10 text-amber-600",
	offer: "bg-green-500/10 text-green-600",
	accepted: "bg-emerald-500/10 text-emerald-600",
	rejected: "bg-red-500/10 text-red-600",
	withdrawn: "bg-secondary text-secondary-foreground",
	ghosted: "bg-secondary text-secondary-foreground",
	archived: "bg-secondary text-secondary-foreground",
};

export const PRIORITY_LABELS: Record<string, string> = {
	low: "Faible",
	medium: "Moyenne",
	high: "Haute",
};

export const PRIORITY_COLORS: Record<string, string> = {
	low: "bg-muted text-muted-foreground",
	medium: "bg-amber-500/10 text-amber-600",
	high: "bg-red-500/10 text-red-600",
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(
	([value, label]) => ({ value, label }),
);
export const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(
	([value, label]) => ({ value, label }),
);
