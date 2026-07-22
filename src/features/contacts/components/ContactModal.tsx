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
	Mail,
	Phone,
	ExternalLink,
	FileText,
	Trash2,
	Loader2,
	Check,
	AlertCircle,
} from "lucide-react";
import { useUpdateContact, useDeleteContact } from "@/features/contacts/hooks";
import type { ContactRow } from "@/features/contacts/queries";

export type ContactData = ContactRow;

interface Props {
	contacts: ContactData[];
	selectedId?: string | null;
	onOpenChange?: (open: boolean) => void;
	onDeleted?: (name: string) => void;
}

export default function ContactModal({
	contacts,
	selectedId,
	onOpenChange,
	onDeleted,
}: Props) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<ContactData | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const [form, setForm] = useState({
		name: "",
		role: "",
		email: "",
		phone: "",
		linkedin: "",
		notes: "",
	});

	const updateMutation = useUpdateContact();
	const deleteMutation = useDeleteContact();

	const openModal = useCallback(
		(id: string) => {
			const c = contacts.find((a) => a.id === id);
			if (c) {
				setSelected(c);
				setForm({
					name: c.name,
					role: c.role ?? "",
					email: c.email ?? "",
					phone: c.phone ?? "",
					linkedin: c.linkedin ?? "",
					notes: c.notes ?? "",
				});
				setOpen(true);
				setFeedback(null);
				setConfirmDelete(false);
			}
		},
		[contacts],
	);

	const closeModal = useCallback(() => {
		setOpen(false);
		onOpenChange?.(false);
	}, [onOpenChange]);

	useEffect(() => {
		if (selectedId) {
			const c = contacts.find((a) => a.id === selectedId);
			if (c) {
				setSelected(c);
				setForm({
					name: c.name,
					role: c.role ?? "",
					email: c.email ?? "",
					phone: c.phone ?? "",
					linkedin: c.linkedin ?? "",
					notes: c.notes ?? "",
				});
				setOpen(true);
				setFeedback(null);
				setConfirmDelete(false);
			}
		}
	}, [selectedId, contacts]);

	const hasChanges = selected
		? form.name !== selected.name ||
			form.role !== (selected.role ?? "") ||
			form.email !== (selected.email ?? "") ||
			form.phone !== (selected.phone ?? "") ||
			form.linkedin !== (selected.linkedin ?? "") ||
			form.notes !== (selected.notes ?? "")
		: false;

	const handleSave = () => {
		if (!selected) return;
		setSaving(true);
		setFeedback(null);
		const data: Record<string, unknown> = {
			name: form.name || null,
			role: form.role || null,
			email: form.email || null,
			phone: form.phone || null,
			linkedin: form.linkedin || null,
			notes: form.notes || null,
		};

		updateMutation.mutate(
			{ id: selected.id, data },
			{
				onSettled: () => setSaving(false),
				onSuccess: () => {
					setFeedback({ type: "success", message: "Contact mis à jour" });
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
		const contactName = selected.name;
		setDeleting(true);
		deleteMutation.mutate(selected.id, {
			onSettled: () => setDeleting(false),
			onSuccess: () => {
				setSelected(null);
				closeModal();
				onDeleted?.(contactName);
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
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-medium text-muted-foreground">
							{selected.name.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1 min-w-0">
							<DialogTitle className="text-lg truncate">
								{selected.name}
							</DialogTitle>
							<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<Building2 className="h-3.5 w-3.5 shrink-0" />
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
							Poste
						</label>
						<input
							value={form.role}
							onChange={(e) => setForm({ ...form, role: e.target.value })}
							className={inputClass}
							placeholder="CTO, Recruteur..."
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<Mail className="mr-1 inline h-3 w-3" />
							Email
						</label>
						<input
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							className={inputClass}
							placeholder="email@example.com"
							disabled={saving}
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							<Phone className="mr-1 inline h-3 w-3" />
							Téléphone
						</label>
						<input
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
							className={inputClass}
							placeholder="+33 6 12 34 56 78"
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
							placeholder="https://linkedin.com/in/"
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
							placeholder="Informations complémentaires..."
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
