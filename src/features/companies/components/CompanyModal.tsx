import { useEffect, useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Building2,
	Globe,
	ExternalLink,
	MapPin,
	Trash2,
	Loader2,
	Check,
	AlertCircle,
} from "lucide-react";
import { useUpdateCompany, useDeleteCompany } from "@/features/companies/hooks";
import type { CompanyRow } from "@/features/companies/queries";

export type CompanyData = CompanyRow;

interface Props {
	companies: CompanyData[];
	selectedId?: string | null;
	onOpenChange?: (open: boolean) => void;
	onDeleted?: (name: string) => void;
}

export default function CompanyModal({
	companies,
	selectedId,
	onOpenChange,
	onDeleted,
}: Props) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<CompanyData | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const [form, setForm] = useState({
		name: "",
		industry: "",
		size: "",
		location: "",
		website: "",
		linkedin: "",
	});

	const updateMutation = useUpdateCompany();
	const deleteMutation = useDeleteCompany();

	const openModal = useCallback(
		(id: string) => {
			const c = companies.find((a) => a.id === id);
			if (c) {
				setSelected(c);
				setForm({
					name: c.name,
					industry: c.industry ?? "",
					size: c.size ?? "",
					location: c.location ?? "",
					website: c.website ?? "",
					linkedin: c.linkedin ?? "",
				});
				setOpen(true);
				setFeedback(null);
				setConfirmDelete(false);
			}
		},
		[companies],
	);

	const closeModal = useCallback(() => {
		setOpen(false);
		onOpenChange?.(false);
	}, [onOpenChange]);

	useEffect(() => {
		if (selectedId) {
			const c = companies.find((a) => a.id === selectedId);
			if (c) {
				setSelected(c);
				setForm({
					name: c.name,
					industry: c.industry ?? "",
					size: c.size ?? "",
					location: c.location ?? "",
					website: c.website ?? "",
					linkedin: c.linkedin ?? "",
				});
				setOpen(true);
				setFeedback(null);
				setConfirmDelete(false);
			}
		}
	}, [selectedId, companies]);

	const hasChanges = selected
		? form.name !== selected.name ||
			form.industry !== (selected.industry ?? "") ||
			form.size !== (selected.size ?? "") ||
			form.location !== (selected.location ?? "") ||
			form.website !== (selected.website ?? "") ||
			form.linkedin !== (selected.linkedin ?? "")
		: false;

	const handleSave = () => {
		if (!selected) return;
		setSaving(true);
		setFeedback(null);
		const data: Record<string, unknown> = {};
		if (form.name !== selected.name) data.name = form.name;
		data.industry = form.industry || null;
		data.size = form.size || null;
		data.location = form.location || null;
		data.website = form.website || null;
		data.linkedin = form.linkedin || null;

		updateMutation.mutate(
			{ id: selected.id, data },
			{
				onSettled: () => setSaving(false),
				onSuccess: () => {
					setFeedback({ type: "success", message: "Entreprise mise à jour" });
					setSelected({ ...selected, ...data } as CompanyData);
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
		setDeleting(true);
		const companyName = selected.name;
	deleteMutation.mutate(selected.id, {
			onSettled: () => setDeleting(false),
			onSuccess: () => {
				setSelected(null);
				closeModal();
				onDeleted?.(companyName);
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
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-medium text-muted-foreground">
							{selected.name.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1 min-w-0">
							<DialogTitle className="text-lg truncate">
								{selected.name}
							</DialogTitle>
							{selected.industry && (
								<p className="text-sm text-muted-foreground">
									{selected.industry}
								</p>
							)}
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
					<div className="col-span-2">
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Nom
						</label>
						<input
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							className={inputClass}
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Secteur
						</label>
						<input
							value={form.industry}
							onChange={(e) => setForm({ ...form, industry: e.target.value })}
							className={inputClass}
							placeholder="Secteur d'activité"
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Taille
						</label>
						<input
							value={form.size}
							onChange={(e) => setForm({ ...form, size: e.target.value })}
							className={inputClass}
							placeholder="Ex: 10-50"
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<MapPin className="mr-1 inline h-3 w-3" />
							Localisation
						</label>
						<input
							value={form.location}
							onChange={(e) => setForm({ ...form, location: e.target.value })}
							className={inputClass}
							placeholder="Ville, pays"
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<Globe className="mr-1 inline h-3 w-3" />
							Site web
						</label>
						<input
							value={form.website}
							onChange={(e) => setForm({ ...form, website: e.target.value })}
							className={inputClass}
							placeholder="https://"
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<ExternalLink className="mr-1 inline h-3 w-3" />
							LinkedIn
						</label>
						<input
							value={form.linkedin}
							onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
							className={inputClass}
							placeholder="https://linkedin.com/"
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
