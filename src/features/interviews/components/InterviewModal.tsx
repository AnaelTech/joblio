import { useEffect, useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	CalendarDays,
	User,
	Clock,
	FileText,
	Trash2,
	Loader2,
	Check,
	AlertCircle,
	BriefcaseBusiness,
	Building2,
} from "lucide-react";
import {
	useUpdateInterview,
	useDeleteInterview,
} from "@/features/interviews/hooks";
import type { InterviewRow } from "@/features/interviews/queries";
import {
	INTERVIEW_TYPE_LABELS,
	INTERVIEW_RESULT_LABELS,
} from "@/features/interviews/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type InterviewData = InterviewRow;

interface Props {
	interviews: InterviewData[];
	selectedId?: string | null;
	onOpenChange?: (open: boolean) => void;
	onDeleted?: (label: string) => void;
}

function formatDate(dateStr: string | Date | null): string {
	if (!dateStr) return "";
	try {
		return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
	} catch {
		return "";
	}
}

function toDatetimeLocal(date: Date | string | null): string {
	if (!date) return "";
	try {
		const d = new Date(date);
		const pad = (n: number) => n.toString().padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	} catch {
		return "";
	}
}

export default function InterviewModal({
	interviews,
	selectedId,
	onOpenChange,
	onDeleted,
}: Props) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<InterviewData | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const [form, setForm] = useState({
		type: "phone_screen",
		scheduledAt: "",
		duration: "",
		result: "pending",
		interviewer: "",
		notes: "",
	});

	const updateMutation = useUpdateInterview();
	const deleteMutation = useDeleteInterview();

	const openModal = useCallback(
		(id: string) => {
			const iv = interviews.find((a) => a.id === id);
			if (iv) {
				setSelected(iv);
				setForm({
					type: iv.type,
					scheduledAt: toDatetimeLocal(iv.scheduledAt),
					duration: iv.duration?.toString() ?? "",
					result: iv.result,
					interviewer: iv.interviewer ?? "",
					notes: iv.notes ?? "",
				});
				setOpen(true);
				setFeedback(null);
				setConfirmDelete(false);
			}
		},
		[interviews],
	);

	const closeModal = useCallback(() => {
		setOpen(false);
		onOpenChange?.(false);
	}, [onOpenChange]);

	useEffect(() => {
		if (!feedback) return;
		const t = setTimeout(() => setFeedback(null), 9000);
		return () => clearTimeout(t);
	}, [feedback]);

	useEffect(() => {
		if (selectedId) {
			const iv = interviews.find((a) => a.id === selectedId);
			if (iv) {
				setSelected(iv);
				setForm({
					type: iv.type,
					scheduledAt: toDatetimeLocal(iv.scheduledAt),
					duration: iv.duration?.toString() ?? "",
					result: iv.result,
					interviewer: iv.interviewer ?? "",
					notes: iv.notes ?? "",
				});
				setOpen(true);
				setFeedback(null);
				setConfirmDelete(false);
			}
		}
	}, [selectedId, interviews]);

	const hasChanges = selected
		? form.type !== selected.type ||
			form.scheduledAt !== toDatetimeLocal(selected.scheduledAt) ||
			form.duration !== (selected.duration?.toString() ?? "") ||
			form.result !== selected.result ||
			form.interviewer !== (selected.interviewer ?? "") ||
			form.notes !== (selected.notes ?? "")
		: false;

	const handleSave = () => {
		if (!selected) return;
		setSaving(true);
		setFeedback(null);
		const data: Record<string, unknown> = {
			type: form.type,
			interviewer: form.interviewer || null,
			duration: form.duration ? Number(form.duration) : null,
			notes: form.notes || null,
			scheduledAt: form.scheduledAt || null,
			result: form.result,
		};

		updateMutation.mutate(
			{ id: selected.id, data },
			{
				onSettled: () => setSaving(false),
				onSuccess: () => {
					setFeedback({ type: "success", message: "Entretien mis à jour" });
				},
				onError: (e) =>
					setFeedback({
						type: "error",
						message: e instanceof Error ? e.message : "Erreur réseau",
					}),
			},
		);
	};

	const handleDelete = () => {
		if (!selected) return;
		const label = `${INTERVIEW_TYPE_LABELS[selected.type] ?? selected.type} - ${selected.applicationTitle}`;
		setDeleting(true);
		deleteMutation.mutate(selected.id, {
			onSettled: () => setDeleting(false),
			onSuccess: () => {
				setSelected(null);
				closeModal();
				onDeleted?.(label);
			},
			onError: (e) => {
				setFeedback({
					type: "error",
					message: e instanceof Error ? e.message : "Erreur réseau",
				});
			},
		});
	};

	if (!selected) {
		return (
			<Dialog
				open={open}
				onOpenChange={(nextOpen: boolean) => {
					if (!nextOpen) closeModal();
				}}
			/>
		);
	}

	const inputClass =
		"h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50";

	const resultColors: Record<string, string> = {
		pending: "bg-amber-500/10 text-amber-600",
		passed: "bg-green-500/10 text-green-600",
		failed: "bg-red-500/10 text-red-600",
		cancelled: "bg-muted text-muted-foreground",
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen: boolean) => {
				if (!nextOpen) closeModal();
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
							{INTERVIEW_TYPE_LABELS[selected.type]?.slice(0, 2) ?? "IV"}
						</div>
						<div className="flex-1 min-w-0">
							<DialogTitle className="text-lg truncate">
								{INTERVIEW_TYPE_LABELS[selected.type] ?? selected.type}
							</DialogTitle>
							<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
								<span className="truncate">{selected.applicationTitle}</span>
							</div>
							<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Building2 className="h-3 w-3 shrink-0" />
								<span className="truncate">{selected.companyName}</span>
							</div>
						</div>
					</div>
				</DialogHeader>

				{feedback && (
					<div
						className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
							feedback.type === "success"
								? "bg-green-500/10 text-green-600"
								: "bg-red-500/10 text-red-600"
						}`}
					>
						{feedback.type === "success" ? (
							<Check className="h-3.5 w-3.5" />
						) : (
							<AlertCircle className="h-3.5 w-3.5" />
						)}
						{feedback.message}
					</div>
				)}

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Type
						</label>
						<select
							value={form.type}
							onChange={(e) => setForm({ ...form, type: e.target.value })}
							disabled={saving}
							className={inputClass}
						>
							{Object.entries(INTERVIEW_TYPE_LABELS).map(([v, l]) => (
								<option key={v} value={v}>
									{l}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Résultat
						</label>
						<select
							value={form.result}
							onChange={(e) => setForm({ ...form, result: e.target.value })}
							disabled={saving}
							className={inputClass}
						>
							{Object.entries(INTERVIEW_RESULT_LABELS).map(([v, l]) => (
								<option key={v} value={v}>
									{l}
								</option>
							))}
						</select>
						{selected.result !== form.result && (
							<p
								className={`mt-1 inline-flex items-center rounded-full px-2 text-[10px] font-medium ${resultColors[form.result] ?? ""}`}
							>
								{INTERVIEW_RESULT_LABELS[form.result]}
							</p>
						)}
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<CalendarDays className="mr-1 inline h-3 w-3" />
							Date
						</label>
						<input
							type="datetime-local"
							value={form.scheduledAt}
							onChange={(e) =>
								setForm({ ...form, scheduledAt: e.target.value })
							}
							className={inputClass}
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<Clock className="mr-1 inline h-3 w-3" />
							Durée (min)
						</label>
						<input
							type="number"
							min="1"
							value={form.duration}
							onChange={(e) => setForm({ ...form, duration: e.target.value })}
							className={inputClass}
							placeholder="60"
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<User className="mr-1 inline h-3 w-3" />
							Recruteur
						</label>
						<input
							value={form.interviewer}
							onChange={(e) =>
								setForm({ ...form, interviewer: e.target.value })
							}
							className={inputClass}
							placeholder="Nom du recruteur"
							disabled={saving}
						/>
					</div>
					<div className="col-span-2">
						<label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
							<FileText className="h-3.5 w-3.5" />
							Notes
						</label>
						<textarea
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
							rows={3}
							placeholder="Préparations, questions à poser..."
							className="min-h-16 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
							disabled={saving}
						/>
					</div>
				</div>

				<div className="flex items-center justify-between border-t pt-4">
					<div className="flex items-center gap-2">
						{confirmDelete ? (
							<>
								<span className="text-sm text-muted-foreground">
									Confirmer la suppression ?
								</span>
								<Button
									size="sm"
									variant="destructive"
									disabled={deleting}
									onClick={handleDelete}
								>
									{deleting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Trash2 className="h-3.5 w-3.5" />
									)}
									Supprimer
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={deleting}
									onClick={() => setConfirmDelete(false)}
								>
									Annuler
								</Button>
							</>
						) : (
							<Button
								size="sm"
								variant="ghost"
								className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
								onClick={() => setConfirmDelete(true)}
							>
								<Trash2 className="h-3.5 w-3.5" />
								Supprimer
							</Button>
						)}
					</div>

					<Button
						size="sm"
						variant="default"
						disabled={saving || !hasChanges}
						onClick={handleSave}
					>
						{saving ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<Check className="h-3.5 w-3.5" />
						)}
						Enregistrer
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
