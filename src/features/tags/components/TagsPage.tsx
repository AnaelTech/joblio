import {
	AlertCircle,
	Check,
	Loader2,
	Pencil,
	Plus,
	Search,
	Tags as TagsIcon,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteTag, useTags, useUpdateTag } from "@/features/tags/hooks";
import type { TagRow } from "@/features/tags/queries";
import { TAG_COLORS } from "@/features/tags/schema";

interface Props {
	initialData: TagRow[];
	search: string;
}

function TagsPageInner({ initialData, search }: Props) {
	const { data: tags, isLoading } = useTags(initialData);
	const updateMutation = useUpdateTag();
	const deleteMutation = useDeleteTag();

	const [editing, setEditing] = useState<TagRow | null>(null);
	const [editName, setEditName] = useState("");
	const [editColor, setEditColor] = useState("");
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

	const openEdit = useCallback((tag: TagRow) => {
		setEditing(tag);
		setEditName(tag.name);
		setEditColor(tag.color ?? "");
	}, []);

	const closeEdit = useCallback(() => {
		setEditing(null);
		setFeedback(null);
	}, []);

	const handleSave = () => {
		if (!editing) return;
		setSaving(true);
		setFeedback(null);

		const data: Record<string, unknown> = {};
		if (editName !== editing.name) data.name = editName;
		const newColor = editColor || null;
		if (newColor !== editing.color) data.color = newColor;

		if (Object.keys(data).length === 0) {
			closeEdit();
			return;
		}

		updateMutation.mutate(
			{ id: editing.id, data },
			{
				onSettled: () => setSaving(false),
				onSuccess: () => {
					setFeedback({ type: "success", message: "Tag mis à jour" });
					setTimeout(closeEdit, 1200);
				},
				onError: (e) =>
					setFeedback({
						type: "error",
						message: e instanceof Error ? e.message : "Erreur réseau",
					}),
			},
		);
	};

	const handleDelete = (id: string) => {
		setDeleting(id);
		deleteMutation.mutate(id, {
			onSettled: () => {
				setDeleting(null);
				setConfirmDelete(null);
			},
			onError: (e) =>
				setFeedback({
					type: "error",
					message: e instanceof Error ? e.message : "Erreur réseau",
				}),
		});
	};

	const filtered = search
		? tags?.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
		: tags;

	const hasFilters = Boolean(search);

	return (
		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="text-2xl font-bold tracking-tight">Tags</h1>
					<p class="text-muted-foreground">
						Gérez vos tags pour catégoriser les candidatures
					</p>
				</div>
				<a href="/tags/new" class="btn-primary">
					<Plus class="h-4 w-4" />
					<span class="hidden sm:inline">Nouveau tag</span>
					<span class="sm:hidden">Ajouter</span>
				</a>
			</div>

			<form
				method="GET"
				id="filter-form"
				class="flex flex-wrap items-end gap-3"
			>
				<div class="relative min-w-0 flex-1 basis-[200px]">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
						<Search class="h-4 w-4 text-muted-foreground" />
					</div>
					<input
						name="q"
						type="text"
						defaultValue={search}
						placeholder="Rechercher un tag..."
						class="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					/>
				</div>
				{hasFilters && (
					<a
						href="/tags"
						class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<X class="h-4 w-4" /> Réinitialiser
					</a>
				)}
			</form>

			{feedback && (
				<div
					class={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
						feedback.type === "success"
							? "bg-green-500/10 text-green-600"
							: "bg-red-500/10 text-red-600"
					}`}
				>
					{feedback.type === "success" ? (
						<Check class="h-3.5 w-3.5" />
					) : (
						<AlertCircle class="h-3.5 w-3.5" />
					)}
					{feedback.message}
				</div>
			)}

			{isLoading ? (
				<div class="flex items-center justify-center py-8">
					<Loader2 class="size-5 animate-spin text-muted-foreground" />
				</div>
			) : filtered && filtered.length > 0 ? (
				<Card>
					<CardContent class="p-0">
						<div class="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{filtered.map((t) => (
								<div
									key={t.id}
									class="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
								>
									<div
										class="h-4 w-4 shrink-0 rounded-full"
										style={{
											backgroundColor: t.color ?? "#e2e8f0",
										}}
									/>
									<span class="flex-1 truncate text-sm font-medium">
										{t.name}
									</span>
									<div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
										<button
											onClick={() => openEdit(t)}
											class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
											title="Modifier"
										>
											<Pencil class="h-3.5 w-3.5" />
										</button>
										{confirmDelete === t.id ? (
											<>
												<Button
													size="sm"
													variant="destructive"
													disabled={deleting === t.id}
													onClick={() => handleDelete(t.id)}
													class="h-7 px-2 text-xs"
												>
													{deleting === t.id ? (
														<Loader2 class="h-3 w-3 animate-spin" />
													) : (
														<Trash2 class="h-3 w-3" />
													)}
												</Button>
												<button
													onClick={() => setConfirmDelete(null)}
													class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
												>
													Annuler
												</button>
											</>
										) : (
											<button
												onClick={() => setConfirmDelete(t.id)}
												class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-red-600"
												title="Supprimer"
											>
												<Trash2 class="h-3.5 w-3.5" />
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent class="p-6">
						<div class="flex flex-col items-center gap-3 py-8">
							<TagsIcon class="h-6 w-6 text-muted-foreground" />
							<p class="text-sm text-muted-foreground">
								{search
									? `Aucun résultat pour "${search}"`
									: "Créez des tags pour organiser vos candidatures."}
							</p>
							{!search && (
								<a href="/tags/new" class="btn-primary">
									<Plus class="h-4 w-4" /> Nouveau tag
								</a>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			<Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
				<DialogContent class="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Modifier le tag</DialogTitle>
					</DialogHeader>

					{feedback && (
						<div
							class={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${
								feedback.type === "success"
									? "bg-green-500/10 text-green-600"
									: "bg-red-500/10 text-red-600"
							}`}
						>
							{feedback.type === "success" ? (
								<Check class="h-3.5 w-3.5" />
							) : (
								<AlertCircle class="h-3.5 w-3.5" />
							)}
							{feedback.message}
						</div>
					)}

					<div class="space-y-4">
						<div>
							<label for="edit-name" class="mb-1.5 block text-sm font-medium">
								Nom <span class="text-red-500">*</span>
							</label>
							<input
								id="edit-name"
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								class="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								disabled={saving}
							/>
						</div>

						<div>
							<label class="mb-1.5 block text-sm font-medium">Couleur</label>
							<div class="flex flex-wrap gap-2">
								{TAG_COLORS.map((c) => (
									<label
										key={c.value}
										class={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
											editColor === c.value
												? "border-primary bg-primary/5"
												: "border-input hover:border-foreground/30"
										}`}
									>
										<input
											type="radio"
											name="edit-color"
											value={c.value}
											checked={editColor === c.value}
											onChange={(e) => setEditColor(e.target.value)}
											class="sr-only"
										/>
										{c.value ? (
											<div
												class="h-3.5 w-3.5 rounded-full"
												style={{ backgroundColor: c.value }}
											/>
										) : (
											<div class="h-3.5 w-3.5 rounded-full border border-dashed border-muted-foreground" />
										)}
										<span>{c.label}</span>
									</label>
								))}
							</div>
						</div>
					</div>

					<div class="flex items-center justify-end gap-2 pt-2">
						<Button
							variant="outline"
							size="sm"
							disabled={saving}
							onClick={closeEdit}
						>
							Annuler
						</Button>
						<Button
							size="sm"
							disabled={saving || !editName.trim()}
							onClick={handleSave}
						>
							{saving ? (
								<Loader2 class="h-3.5 w-3.5 animate-spin" />
							) : (
								<Check class="h-3.5 w-3.5" />
							)}
							Enregistrer
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default function TagsPage(props: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<TagsPageInner {...props} />
		</QueryClientProvider>
	);
}
