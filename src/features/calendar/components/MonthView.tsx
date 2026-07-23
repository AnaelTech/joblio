import {
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { useMemo } from "react";
import type { CalendarEvent } from "../types";

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface Props {
	currentDate: Date;
	events: CalendarEvent[];
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
}

export default function MonthView({
	currentDate,
	events,
	selectedDate,
	onSelectDate,
}: Props) {
	const days = useMemo(() => {
		const monthStart = startOfMonth(currentDate);
		const monthEnd = endOfMonth(currentDate);
		const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
		const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
		return eachDayOfInterval({ start: calStart, end: calEnd });
	}, [currentDate]);

	const eventMap = useMemo(() => {
		const map = new Map<string, CalendarEvent[]>();
		for (const e of events) {
			const key = format(new Date(e.date), "yyyy-MM-dd");
			const existing = map.get(key) ?? [];
			existing.push(e);
			map.set(key, existing);
		}
		return map;
	}, [events]);

	return (
		<div className="rounded-xl border bg-card">
			{/* Day headers — hidden on mobile */}
			<div className="hidden sm:grid sm:grid-cols-7">
				{DAY_NAMES.map((name) => (
					<div
						key={name}
						className="border-b border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
					>
						{name}
					</div>
				))}
			</div>

			{/* Day headers — mobile abbreviated */}
			<div className="grid grid-cols-7 sm:hidden">
				{DAY_NAMES.map((name) => (
					<div
						key={name}
						className="border-b px-0.5 py-1.5 text-center text-[10px] font-medium text-muted-foreground"
					>
						{name.slice(0, 1)}
					</div>
				))}
			</div>

			{/* Day cells */}
			<div className="grid grid-cols-7">
				{days.map((day) => {
					const key = format(day, "yyyy-MM-dd");
					const dayEvents = eventMap.get(key) ?? [];
					const isCurrentMonth = isSameMonth(day, currentDate);
					const isSelected = selectedDate
						? isSameDay(day, selectedDate)
						: false;
					const today = isToday(day);

					return (
						<button
							key={key}
							type="button"
							onClick={() => onSelectDate(day)}
							className={`cursor-pointer border-b border-r text-left transition-colors last:border-r-0 hover:bg-muted/50 ${
								!isCurrentMonth ? "bg-muted/20" : ""
							} ${
								isSelected
									? "bg-primary/5 ring-2 ring-inset ring-primary/30"
									: ""
							}`}
						>
							<div
								className={`flex min-h-10 flex-col items-center justify-start gap-px px-0.5 py-1.5 sm:min-h-[90px] sm:items-start sm:px-2 sm:py-2 ${
									isSelected ? "pt-1.5 sm:pt-2" : ""
								}`}
							>
								<span
									className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-medium sm:size-6 sm:text-sm ${
										today
											? "bg-primary text-primary-foreground font-semibold"
											: isCurrentMonth
												? "text-foreground"
												: "text-muted-foreground/50"
									}`}
								>
									{format(day, "d")}
								</span>

								{dayEvents.length > 0 && (
									<div className="mt-auto flex flex-wrap items-center gap-0.5 sm:mt-0.5">
										{dayEvents.slice(0, 3).map((e) => (
											<div
												key={e.id}
												className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
												style={{
													backgroundColor:
														e.type === "interview"
															? "#3b82f6"
															: e.type === "follow_up"
																? "#f59e0b"
																: e.type === "application_sent"
																	? "#22c55e"
																	: e.type === "response_received"
																		? "#8b5cf6"
																		: "#94a3b8",
												}}
												title={`${e.title}${e.interviewType ? ` (${e.interviewType})` : ""}`}
											/>
										))}
										<span className="inline-flex min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[9px] font-semibold leading-4 text-muted-foreground">
											{dayEvents.length}
										</span>
									</div>
								)}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
