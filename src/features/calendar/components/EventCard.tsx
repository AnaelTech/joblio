import { format, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import type { CalendarEvent } from "../types";
import { INTERVIEW_TYPE_LABELS, RESULT_LABELS } from "../types";

interface Props {
	event: CalendarEvent;
	onClick?: () => void;
	compact?: boolean;
}

const _TYPE_ICONS: Record<string, string> = {
	interview: "\u{1F4CB}",
	follow_up: "\u{23F0}",
	application_sent: "\u{2709}\u{FE0F}",
	response_received: "\u{1F4E8}",
	activity: "\u{1F4C4}",
};

const TYPE_COLORS: Record<string, string> = {
	interview: "border-l-blue-500 bg-blue-500/5",
	follow_up: "border-l-amber-500 bg-amber-500/5",
	application_sent: "border-l-emerald-500 bg-emerald-500/5",
	response_received: "border-l-violet-500 bg-violet-500/5",
	activity: "border-l-slate-400 bg-slate-400/5",
};

function formatTime(date: Date): string {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	if (hours === 0 && minutes === 0) return "";
	return format(date, "HH:mm");
}

export default function EventCard({ event, onClick, compact }: Props) {
	const date = new Date(event.date);
	const timeStr = formatTime(date);
	const dayLabel = isToday(date)
		? "Aujourd'hui"
		: format(date, "EEEE dd MMM", { locale: fr });

	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full cursor-pointer rounded-lg border-l-[3px] p-3 text-left transition-colors hover:bg-muted/50 ${
				TYPE_COLORS[event.type] ?? "border-l-slate-400"
			} ${compact ? "py-2" : ""}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					{!compact && (
						<p className="text-[11px] text-muted-foreground">
							{dayLabel}
							{timeStr ? ` à ${timeStr}` : ""}
						</p>
					)}
					<p className={`text-sm font-medium ${compact ? "" : "mt-0.5"}`}>
						{event.title}
					</p>
					<p className="text-xs text-muted-foreground">{event.description}</p>

					{event.interviewType && (
						<span className="mt-1 inline-flex h-5 items-center rounded-full bg-blue-500/10 px-2 text-[11px] font-medium text-blue-600">
							{INTERVIEW_TYPE_LABELS[event.interviewType] ??
								event.interviewType}
							{event.result && event.result !== "pending"
								? ` · ${RESULT_LABELS[event.result] ?? event.result}`
								: ""}
						</span>
					)}

					{event.action && (
						<span className="mt-1 inline-flex h-5 items-center rounded-full bg-slate-500/10 px-2 text-[11px] font-medium text-slate-600">
							{event.action}
						</span>
					)}
				</div>

				{compact && timeStr && (
					<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
						{timeStr}
					</span>
				)}
			</div>
		</button>
	);
}
