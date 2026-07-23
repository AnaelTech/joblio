export interface CalendarEvent {
	id: string;
	date: Date;
	title: string;
	description: string;
	type:
		| "interview"
		| "follow_up"
		| "application_sent"
		| "response_received"
		| "activity";
	applicationId: string;
	applicationTitle: string;
	companyName: string;
	interviewType?: string;
	duration?: number;
	result?: string;
	action?: string;
}

export type CalendarView = "calendar" | "agenda" | "timeline";

export const INTERVIEW_TYPE_LABELS: Record<string, string> = {
	phone_screen: "Téléphonique",
	hr: "RH",
	technical: "Technique",
	manager: "Manager",
	final: "Final",
	other: "Autre",
};

export const ACTIVITY_LABELS: Record<string, string> = {
	created: "Candidature créée",
	updated: "Candidature modifiée",
	deleted: "Candidature supprimée",
	status_changed: "Statut changé",
	follow_up: "Relance effectuée",
	note_added: "Note ajoutée",
	document_added: "Document ajouté",
	document_removed: "Document supprimé",
	interview_scheduled: "Entretien planifié",
	interview_completed: "Entretien terminé",
	archived: "Candidature archivée",
};

export const RESULT_LABELS: Record<string, string> = {
	pending: "À venir",
	passed: "Réussi",
	failed: "Échoué",
	cancelled: "Annulé",
};
