import { useState, useCallback, useMemo, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInterviews } from "@/features/interviews/hooks";
import InterviewModal from "@/features/interviews/components/InterviewModal";
import type { InterviewData } from "@/features/interviews/components/InterviewModal";
import {
	CalendarDays,
	User,
	CheckCircle,
} from "lucide-react";
import {
	INTERVIEW_TYPE_LABELS,
	INTERVIEW_RESULT_LABELS,
} from "@/features/interviews/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const queryClient = new QueryClient();
const EMPTY_FILTERS = {};

interface Props {
	initialData: InterviewData[];
}

const resultColors: Record<string, string> = {
	pending: "bg-amber-500/10 text-amber-600",
	passed: "bg-green-500/10 text-green-600",
	failed: "bg-red-500/10 text-red-600",
	cancelled: "bg-muted text-muted-foreground",
};

function InterviewsInner({ initialData }: Props) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const filters = useMemo(() => EMPTY_FILTERS, []);
	const { data } = useInterviews(filters, initialData);
	const interviews = data ?? initialData;

	const handleRowClick = useCallback((id: string) => {
		setSelectedId(id);
	}, []);

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 2000);
		return () => clearTimeout(t);
	}, [toast]);

	if (interviews.length === 0) return null;

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b text-left text-sm text-muted-foreground">
							<th className="py-3 pr-4 font-medium">Type</th>
							<th className="py-3 pr-4 font-medium">Poste</th>
							<th className="hidden py-3 pr-4 font-medium sm:table-cell">Entreprise</th>
							<th className="hidden py-3 pr-4 font-medium md:table-cell">Date</th>
							<th className="hidden py-3 pr-4 font-medium md:table-cell">Recruteur</th>
							<th className="py-3 pr-4 font-medium">Résultat</th>
						</tr>
					</thead>
					<tbody>
						{interviews.map((iv) => (
							<tr
								key={iv.id}
								className="cursor-pointer border-b transition-colors hover:bg-muted/50"
								onClick={() => handleRowClick(iv.id)}
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleRowClick(iv.id);
								}}
							>
								<td className="py-3 pr-4">
									<span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
										{INTERVIEW_TYPE_LABELS[iv.type] ?? iv.type}
									</span>
								</td>
								<td className="py-3 pr-4">
									<span className="text-sm font-medium">{iv.applicationTitle}</span>
								</td>
								<td className="hidden py-3 pr-4 sm:table-cell">
									<span className="text-sm text-muted-foreground">{iv.companyName}</span>
								</td>
								<td className="hidden py-3 pr-4 md:table-cell">
									{iv.scheduledAt ? (
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<CalendarDays className="h-3.5 w-3.5 shrink-0" />
											{format(new Date(iv.scheduledAt), "dd MMM yyyy", { locale: fr })}
											{iv.duration && (
												<span className="text-xs">· {iv.duration}min</span>
											)}
										</div>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>
								<td className="hidden py-3 pr-4 md:table-cell">
									{iv.interviewer ? (
										<div className="flex items-center gap-1 text-sm text-muted-foreground">
											<User className="h-3.5 w-3.5 shrink-0" />
											{iv.interviewer}
										</div>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>
								<td className="py-3 pr-4">
									<span
										className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${resultColors[iv.result] ?? "bg-muted text-muted-foreground"}`}
									>
										{INTERVIEW_RESULT_LABELS[iv.result] ?? iv.result}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<InterviewModal
				interviews={interviews}
				selectedId={selectedId}
				onOpenChange={(open) => {
					if (!open) setSelectedId(null);
				}}
				onDeleted={(label) => setToast(`"${label}" a été supprimé`)}
			/>

			{toast && (
				<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm text-white shadow-lg animate-in slide-in-from-bottom-2">
					<CheckCircle className="h-4 w-4 shrink-0" />
					{toast}
				</div>
			)}
		</>
	);
}

export default function InterviewsPage({ initialData }: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<InterviewsInner initialData={initialData} />
		</QueryClientProvider>
	);
}
