import { QueryClientProvider } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { useState } from "react";
import { queryClient } from "@/lib/query-client";
import { useMarkAllRead, useMarkRead, useNotifications } from "../hooks";

const TYPE_LABELS: Record<string, string> = {
	follow_up: "Relance",
	interview: "Entretien",
	deadline: "Échéance",
};

const TYPE_COLORS: Record<string, string> = {
	follow_up: "border-l-amber-500 bg-amber-500/5",
	interview: "border-l-blue-500 bg-blue-500/5",
	deadline: "border-l-red-500 bg-red-500/5",
};

function NotificationsInner() {
	const { data: notifications } = useNotifications();
	const markRead = useMarkRead();
	const markAllRead = useMarkAllRead();
	const [filter, setFilter] = useState<"all" | "unread">("all");

	const items =
		filter === "unread"
			? (notifications ?? []).filter((n) => !n.read)
			: (notifications ?? []);
	const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
				<p className="text-sm text-muted-foreground">
					Consultez l'historique de vos alertes et relances.
				</p>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex gap-1 rounded-lg bg-muted p-0.5">
					<button
						type="button"
						onClick={() => setFilter("all")}
						className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
							filter === "all"
								? "bg-card text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Toutes
					</button>
					<button
						type="button"
						onClick={() => setFilter("unread")}
						className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
							filter === "unread"
								? "bg-card text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Non lues{unreadCount > 0 ? ` (${unreadCount})` : ""}
					</button>
				</div>

				{unreadCount > 0 && (
					<button
						type="button"
						onClick={() => markAllRead.mutate()}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<CheckCheck className="size-4" />
						Tout marquer comme lu
					</button>
				)}
			</div>

			{items.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-20 text-center">
					<Bell className="size-10 text-muted-foreground/40" />
					<p className="text-sm text-muted-foreground">
						{filter === "unread"
							? "Aucune notification non lue."
							: "Aucune notification."}
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{items.map((n) => (
						<div
							key={n.id}
							className={`flex items-start gap-3 rounded-lg border-l-[3px] p-4 transition-colors ${
								TYPE_COLORS[n.type] ?? "border-l-slate-400"
							} ${n.read ? "opacity-60" : ""}`}
						>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-muted-foreground">
										{TYPE_LABELS[n.type] ?? n.type}
									</span>
									<span className="text-xs text-muted-foreground/60">
										{format(new Date(n.createdAt), "dd MMM yyyy HH:mm", {
											locale: fr,
										})}
									</span>
									{n.link && (
										<a
											href={n.link}
											className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
										>
											Voir <ExternalLink className="size-3" />
										</a>
									)}
								</div>
								<p className="mt-0.5 text-sm font-medium">{n.title}</p>
								{n.message && (
									<p className="mt-0.5 text-xs text-muted-foreground">
										{n.message}
									</p>
								)}
							</div>

							{!n.read && (
								<button
									type="button"
									onClick={() => markRead.mutate(n.id)}
									className="mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
									aria-label="Marquer comme lu"
								>
									<Check className="size-4" />
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default function NotificationsPage() {
	return (
		<QueryClientProvider client={queryClient}>
			<NotificationsInner />
		</QueryClientProvider>
	);
}
