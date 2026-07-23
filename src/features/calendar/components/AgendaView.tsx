import {
	endOfWeek,
	format,
	isSameDay,
	isToday,
	isTomorrow,
	isWithinInterval,
	startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";
import type { CalendarEvent } from "../types";
import EventCard from "./EventCard";

interface Props {
	events: CalendarEvent[];
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
	onSelectApp: (appId: string) => void;
}

interface DayGroup {
	label: string;
	date: Date;
	events: CalendarEvent[];
}

export default function AgendaView({
	events,
	selectedDate,
	onSelectDate,
	onSelectApp,
}: Props) {
	const allGroups = useMemo(() => {
		const now = new Date();
		const weekStart = startOfWeek(now, { weekStartsOn: 1 });
		const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

		const map = new Map<string, DayGroup>();

		for (const e of events) {
			const day = new Date(e.date);
			const dateKey = format(day, "yyyy-MM-dd");
			const existing = map.get(dateKey) ?? {
				label: "",
				date: day,
				events: [],
			};

			let label: string;
			if (isToday(day)) {
				label = "Aujourd'hui";
			} else if (isTomorrow(day)) {
				label = "Demain";
			} else if (isWithinInterval(day, { start: weekStart, end: weekEnd })) {
				label = format(day, "EEEE", { locale: fr });
			} else {
				label = format(day, "dd MMM", { locale: fr });
			}

			existing.label = label;
			existing.events.push(e);
			map.set(dateKey, existing);
		}

		return Array.from(map.values()).sort(
			(a, b) => a.date.getTime() - b.date.getTime(),
		);
	}, [events]);

	const groups = useMemo(() => {
		if (!selectedDate) return allGroups;
		return allGroups.filter((g) => isSameDay(g.date, selectedDate));
	}, [allGroups, selectedDate]);

	if (events.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 py-16 text-center">
				<p className="text-sm text-muted-foreground">
					Aucun événement ce mois-ci
				</p>
				<p className="text-xs text-muted-foreground/60">
					Les entretiens, relances et dates de candidature apparaîtront ici
					automatiquement.
				</p>
			</div>
		);
	}

	if (allGroups.length > 0 && groups.length === 0) {
		const dayLabel = selectedDate
			? format(selectedDate, "dd MMM yyyy", { locale: fr })
			: "";
		return (
			<div className="flex flex-col items-center gap-2 py-16 text-center">
				<p className="text-sm text-muted-foreground">
					Aucun événement le {dayLabel}
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 sm:gap-4">
			{/* Mini day selector — scrollable on mobile */}
			<div className="flex gap-1.5 overflow-x-auto pb-1">
				{groups.slice(0, 14).map((g) => {
					const dayNum = format(g.date, "d");
					const dayName = format(g.date, "EEE", { locale: fr }).slice(0, 3);
					const isSel = selectedDate && isSameDay(g.date, selectedDate);
					const today = isToday(g.date);
					return (
						<button
							key={format(g.date, "yyyy-MM-dd")}
							type="button"
							onClick={() => onSelectDate(g.date)}
							className={`flex shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs transition-colors sm:px-2.5 sm:py-1.5 ${
								isSel
									? "bg-primary text-primary-foreground"
									: today
										? "bg-primary/10 text-primary font-medium"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
							}`}
						>
							<span className="text-[10px] uppercase">{dayName}</span>
							<span className="text-sm font-semibold">{dayNum}</span>
						</button>
					);
				})}
			</div>

			{/* Event groups */}
			<div className="flex flex-col gap-6">
				{groups.map((group) => (
					<div key={format(group.date, "yyyy-MM-dd")}>
						<div className="mb-2 flex items-center gap-2">
							<h3 className="text-sm font-semibold">{group.label}</h3>
							<span className="text-xs text-muted-foreground">
								{format(group.date, "dd MMM yyyy", { locale: fr })}
							</span>
							<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
								{group.events.length}
							</span>
						</div>

						<div className="flex flex-col gap-2">
							{group.events.map((e) => (
								<EventCard
									key={e.id}
									event={e}
									onClick={() => onSelectApp(e.applicationId)}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
