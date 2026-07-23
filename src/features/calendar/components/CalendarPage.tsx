import { QueryClientProvider } from "@tanstack/react-query";
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { queryClient } from "@/lib/query-client";
import type { CalendarEvent, CalendarView } from "../types";
import AgendaView from "./AgendaView";
import MonthView from "./MonthView";
import TimelineView from "./TimelineView";

interface Props {
	initialEvents: CalendarEvent[];
}

function CalendarInner({ initialEvents }: Props) {
	const events = useMemo(
		() =>
			initialEvents.map((e) => ({
				...e,
				date: new Date(e.date),
			})),
		[initialEvents],
	);
	const [view, setView] = useState<CalendarView>("agenda");
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

	const range = useMemo(() => {
		const start = startOfMonth(currentDate);
		const end = endOfMonth(currentDate);
		return { start, end };
	}, [currentDate]);

	const filteredEvents = useMemo(() => {
		return events.filter((e) => {
			const d = new Date(e.date);
			return d >= range.start && d <= range.end;
		});
	}, [events, range]);

	const goNext = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), []);
	const goPrev = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), []);
	const goToday = useCallback(() => setCurrentDate(new Date()), []);

	const handleSelectDate = useCallback((date: Date) => {
		setSelectedDate(date);
		setView("agenda");
	}, []);

	const handleSelectApp = useCallback((appId: string) => {
		setSelectedAppId(appId);
		setView("timeline");
	}, []);

	const monthLabel = currentDate.toLocaleDateString("fr-FR", {
		month: "long",
		year: "numeric",
	});

	const tabs: { key: CalendarView; label: string }[] = [
		{ key: "calendar", label: "Calendrier" },
		{ key: "agenda", label: "Agenda" },
		{ key: "timeline", label: "Timeline" },
	];

	return (
		<div className="flex flex-col gap-3 sm:gap-4">
			{/* View tabs — mobile scrollable, desktop inline */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex gap-1 rounded-lg bg-muted p-0.5 overflow-x-auto">
					{tabs.map((t) => (
						<button
							key={t.key}
							type="button"
							onClick={() => setView(t.key)}
							className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
								view === t.key
									? "bg-card text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{t.label}
						</button>
					))}
				</div>

				<div className="flex items-center gap-1 self-start sm:self-auto">
					<button
						type="button"
						onClick={goPrev}
						className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-7"
						aria-label="Mois précédent"
					>
						‹
					</button>
					<button
						type="button"
						onClick={goToday}
						className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-2 sm:py-1 sm:text-xs"
					>
						{monthLabel}
					</button>
					<button
						type="button"
						onClick={goNext}
						className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-7"
						aria-label="Mois suivant"
					>
						›
					</button>
				</div>
			</div>

			{view === "calendar" && (
				<MonthView
					currentDate={currentDate}
					events={filteredEvents}
					selectedDate={selectedDate}
					onSelectDate={handleSelectDate}
				/>
			)}

			{view === "agenda" && (
				<AgendaView
					events={filteredEvents}
					selectedDate={selectedDate}
					onSelectDate={handleSelectDate}
					onSelectApp={handleSelectApp}
				/>
			)}

			{view === "timeline" && (
				<TimelineView
					events={filteredEvents}
					selectedAppId={selectedAppId}
					onSelectApp={handleSelectApp}
				/>
			)}
		</div>
	);
}

export default function CalendarPage(props: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<CalendarInner {...props} />
		</QueryClientProvider>
	);
}
