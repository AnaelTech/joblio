import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";
import type { CalendarEvent } from "../types";
import EventCard from "./EventCard";

interface Props {
	events: CalendarEvent[];
	selectedAppId: string | null;
	onSelectApp: (appId: string) => void;
}

export default function TimelineView({
	events,
	selectedAppId,
	onSelectApp,
}: Props) {
	const [pickerOpen, setPickerOpen] = useState(false);

	const appIds = useMemo(() => {
		const set = new Set<string>();
		for (const e of events) {
			set.add(e.applicationId);
		}
		return Array.from(set);
	}, [events]);

	const appEvents = useMemo(() => {
		if (!selectedAppId) return [];
		return events
			.filter((e) => e.applicationId === selectedAppId)
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}, [events, selectedAppId]);

	const selectedEvent = selectedAppId
		? events.find((e) => e.applicationId === selectedAppId)
		: null;

	if (appIds.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 py-16 text-center">
				<p className="text-sm text-muted-foreground">
					Aucune donnée ce mois-ci
				</p>
				<p className="text-xs text-muted-foreground/60">
					Sélectionnez une vue avec des événements pour voir la timeline.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 sm:gap-4 sm:flex-row">
			{/* Mobile: dropdown picker */}
			<div className="relative sm:hidden">
				<button
					type="button"
					onClick={() => setPickerOpen((v) => !v)}
					className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input px-4 py-3 text-left text-sm transition-colors hover:border-foreground/30"
				>
					<div className="min-w-0 flex-1">
						{selectedEvent ? (
							<>
								<p className="truncate font-medium">
									{selectedEvent.applicationTitle}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{selectedEvent.companyName}
								</p>
							</>
						) : (
							<p className="text-muted-foreground">
								Sélectionnez une candidature
							</p>
						)}
					</div>
					<svg
						aria-hidden="true"
						className={`size-4 shrink-0 text-muted-foreground transition-transform ${pickerOpen ? "rotate-180" : ""}`}
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
				{pickerOpen && (
					<>
						<button
							type="button"
							className="fixed inset-0 z-10 cursor-default"
							tabIndex={-1}
							aria-hidden="true"
							onClick={() => setPickerOpen(false)}
						/>
						<div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-lg border border-input bg-card shadow-lg">
							{appIds.map((appId) => {
								const ev = events.find((e) => e.applicationId === appId);
								if (!ev) return null;
								const isSel = selectedAppId === appId;
								return (
									<button
										key={appId}
										type="button"
										onClick={() => {
											onSelectApp(appId);
											setPickerOpen(false);
										}}
										className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted ${
											isSel ? "bg-primary/5 font-medium text-primary" : ""
										}`}
									>
										<div
											className="size-2 shrink-0 rounded-full"
											style={{
												backgroundColor:
													ev.type === "interview"
														? "#3b82f6"
														: ev.type === "follow_up"
															? "#f59e0b"
															: ev.type === "application_sent"
																? "#22c55e"
																: ev.type === "response_received"
																	? "#8b5cf6"
																	: "#94a3b8",
											}}
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate">{ev.applicationTitle}</p>
											<p className="truncate text-xs text-muted-foreground">
												{ev.companyName}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					</>
				)}
			</div>

			{/* Desktop: sidebar */}
			<div className="hidden sm:flex sm:w-56 sm:flex-col sm:gap-2">
				<p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
					Candidatures
				</p>
				{appIds.map((appId) => {
					const appEvent = events.find((e) => e.applicationId === appId);
					if (!appEvent) return null;
					const isSelected = selectedAppId === appId;
					return (
						<button
							key={appId}
							type="button"
							onClick={() => onSelectApp(appId)}
							className={`cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
								isSelected
									? "border-primary bg-primary/5 text-primary"
									: "border-input text-foreground hover:border-foreground/30"
							}`}
						>
							<p className="truncate font-medium">
								{appEvent.applicationTitle}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{appEvent.companyName}
							</p>
						</button>
					);
				})}
			</div>

			{/* Timeline */}
			<div className="flex-1">
				{!selectedAppId ? (
					<div className="flex items-center justify-center py-16">
						<p className="text-sm text-muted-foreground">
							Sélectionnez une candidature pour voir sa timeline
						</p>
					</div>
				) : appEvents.length === 0 ? (
					<div className="flex items-center justify-center py-16">
						<p className="text-sm text-muted-foreground">
							Aucun événement pour cette candidature
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-4 sm:relative sm:ml-2 sm:flex-col sm:gap-0 sm:border-l-2 sm:border-muted sm:pl-7">
						{appEvents.map((e) => (
							<div key={e.id} className="sm:relative sm:pb-4 sm:last:pb-0">
								{/* Desktop: timeline dot */}
								<div
									className="hidden sm:absolute sm:-left-8.75 sm:top-1.5 sm:block sm:size-3 sm:rounded-full sm:border-2 sm:border-background"
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
								/>
								{/* Date with inline dot on mobile */}
								<p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-[11px]">
									<span
										className="inline-block size-2 shrink-0 rounded-full sm:hidden"
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
									/>
									{format(new Date(e.date), "dd MMM yyyy HH:mm", {
										locale: fr,
									})}
								</p>
								<EventCard event={e} />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
