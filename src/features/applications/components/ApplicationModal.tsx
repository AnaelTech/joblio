import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BriefcaseBusiness,
  MapPin,
  Calendar,
  Link,
  FileText,
  Building2,
  ArrowUpRight,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Plus,
  X,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/features/applications/constants";
import {
  useUpdateApplication,
  useDeleteApplication,
  useAllTags,
  useAddApplicationTag,
  useRemoveApplicationTag,
} from "@/features/applications/hooks";
import DocumentSection from "@/features/documents/components/DocumentSection";

export interface ApplicationTag {
  id: string;
  name: string;
  color: string | null;
}

export interface ApplicationData {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
  priority: string;
  favorite: boolean;
  location: string | null;
  remoteType: string | null;
  sourceUrl: string | null;
  notes: string | null;
  applicationDate: string | null;
  followUpDate: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  createdAt: string;
  tags: ApplicationTag[];
}

interface Props {
  applications: ApplicationData[];
  selectedId?: string | null;
  onOpenChange?: (open: boolean) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
  } catch {
    return "—";
  }
}

function formatSalary(app: ApplicationData): string {
  if (app.salaryMin === null && app.salaryMax === null) return "";
  const min = app.salaryMin?.toLocaleString("fr-FR");
  const max = app.salaryMax?.toLocaleString("fr-FR");
  if (min && max) return `${min} - ${max} ${app.currency}`;
  if (min) return `À partir de ${min} ${app.currency}`;
  if (max) return `Jusqu'à ${max} ${app.currency}`;
  return "";
}

export default function ApplicationModal({
  applications,
  selectedId,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ApplicationData | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [locationDraft, setLocationDraft] = useState("");
  const [followUpDateDraft, setFollowUpDateDraft] = useState("");
  const [isFollowUpSuggested, setIsFollowUpSuggested] = useState(false);

  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();
  const { data: allTags } = useAllTags();
  const addTagMutation = useAddApplicationTag();
  const removeTagMutation = useRemoveApplicationTag();
  const [tagSaving, setTagSaving] = useState<string | null>(null);
  const [showArchiveSuggestion, setShowArchiveSuggestion] = useState(false);
  const isArchived = selected?.status === "archived";

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 9000);
    return () => clearTimeout(t);
  }, [feedback]);

  useEffect(() => {
    if (!selectedId) return;
    const app = applications.find((a) => a.id === selectedId);
    if (!app) return;
    setSelected(app);
    setNotesDraft(app.notes ?? "");
    setLocationDraft(app.location ?? "");
    const suggestedDate =
      app.status === "applied" && !app.followUpDate
        ? (() => {
            const d = new Date(app.applicationDate || app.createdAt);
            d.setDate(d.getDate() + 8);
            return d.toISOString().split("T")[0];
          })()
        : null;
    setFollowUpDateDraft(app.followUpDate ?? suggestedDate ?? "");
    setIsFollowUpSuggested(!app.followUpDate && suggestedDate !== null);
    setOpen(true);
    setFeedback(null);
    setConfirmDelete(false);
  }, [selectedId, applications]);

  const closeModal = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleStatusChange = (status: string) => {
    if (!selected) return;
    if (status === "rejected") {
      setShowArchiveSuggestion(true);
      return;
    }
    setShowArchiveSuggestion(false);
    setSaving("status");
    setFeedback(null);
    updateMutation.mutate(
      { id: selected.id, data: { status } },
      {
        onSettled: () => setSaving(null),
        onSuccess: () =>
          setFeedback({ type: "success", message: "Statut mis à jour" }),
        onError: (e) =>
          setFeedback({
            type: "error",
            message: e instanceof Error ? e.message : "Erreur réseau",
          }),
      },
    );
  };

  const handleRejectAndArchive = () => {
    if (!selected) return;
    setShowArchiveSuggestion(false);
    setSaving("status");
    setFeedback(null);
    updateMutation.mutate(
      { id: selected.id, data: { status: "archived" } },
      {
        onSettled: () => setSaving(null),
        onSuccess: () =>
          setFeedback({ type: "success", message: "Candidature archivée" }),
        onError: (e) =>
          setFeedback({
            type: "error",
            message: e instanceof Error ? e.message : "Erreur réseau",
          }),
      },
    );
  };

  const handleKeepRejected = () => {
    if (!selected) return;
    setShowArchiveSuggestion(false);
    setSaving("status");
    setFeedback(null);
    updateMutation.mutate(
      { id: selected.id, data: { status: "rejected" } },
      {
        onSettled: () => setSaving(null),
        onSuccess: () =>
          setFeedback({ type: "success", message: "Statut mis à jour" }),
        onError: (e) =>
          setFeedback({
            type: "error",
            message: e instanceof Error ? e.message : "Erreur réseau",
          }),
      },
    );
  };

  const handlePriorityChange = (priority: string) => {
    if (!selected) return;
    setSaving("priority");
    setFeedback(null);
    updateMutation.mutate(
      { id: selected.id, data: { priority } },
      {
        onSettled: () => setSaving(null),
        onSuccess: () =>
          setFeedback({ type: "success", message: "Priorité mise à jour" }),
        onError: (e) =>
          setFeedback({
            type: "error",
            message: e instanceof Error ? e.message : "Erreur réseau",
          }),
      },
    );
  };

  const handleSaveNotes = () => {
    if (!selected) return;
    setSaving("notes");
    setFeedback(null);
    updateMutation.mutate(
      { id: selected.id, data: { notes: notesDraft || null } },
      {
        onSettled: () => setSaving(null),
        onSuccess: () =>
          setFeedback({ type: "success", message: "Notes enregistrées" }),
        onError: (e) =>
          setFeedback({
            type: "error",
            message: e instanceof Error ? e.message : "Erreur réseau",
          }),
      },
    );
  };

  const handleSaveLocation = () => {
    if (!selected) return;
    setSaving("location");
    setFeedback(null);
    const newLocation = locationDraft || null;
    if (newLocation === selected.location) {
      setSaving(null);
      return;
    }
    updateMutation.mutate(
      { id: selected.id, data: { location: newLocation } },
      {
        onSettled: () => setSaving(null),
        onSuccess: () => {
          setSelected({ ...selected, location: newLocation });
          setFeedback({ type: "success", message: "Localisation mise à jour" });
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
    deleteMutation.mutate(selected.id, {
      onSettled: () => setDeleting(false),
      onSuccess: () => {
        setSelected(null);
        closeModal();
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

  const statusClass =
    STATUS_COLORS[selected.status] ?? "bg-muted text-muted-foreground";
  const priorityClass =
    PRIORITY_COLORS[selected.priority] ?? "bg-muted text-muted-foreground";
  const salaryText = formatSalary(selected);

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
              {selected.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg truncate">
                {selected.title}
              </DialogTitle>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{selected.companyName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Statut
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selected.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving === "status" || isArchived}
                className="h-7 rounded-md border bg-transparent px-2 text-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:opacity-50"
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              {saving === "status" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
              {isArchived && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                  Lecture seule
                </span>
              )}
            </div>
            {showArchiveSuggestion && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs">
                <span className="flex-1 text-amber-800">
                  Archiver cette candidature ?
                </span>
                <button
                  onClick={handleRejectAndArchive}
                  disabled={saving === "status"}
                  className="cursor-pointer rounded bg-amber-600 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                >
                  Archiver
                </button>
                <button
                  onClick={handleKeepRejected}
                  disabled={saving === "status"}
                  className="cursor-pointer rounded bg-transparent px-1.5 py-0.5 text-xs text-amber-700 underline-offset-2 hover:underline disabled:opacity-50"
                >
                  Garder en vue
                </button>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Priorité
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selected.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={saving === "priority" || isArchived}
                className="h-7 rounded-md border bg-transparent px-2 text-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none disabled:opacity-50"
              >
                {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              {saving === "priority" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {selected.tags.map((t) => (
            <span
              key={t.id}
              className="inline-flex h-5 items-center gap-1 rounded-full px-2 text-xs font-medium"
              style={{
                backgroundColor: t.color ? `${t.color}20` : undefined,
                color: t.color ?? undefined,
              }}
            >
              {t.name}
              {!isArchived && (
                <button
                  onClick={() => {
                    setTagSaving(t.id);
                    removeTagMutation.mutate(
                      { applicationId: selected.id, tagId: t.id },
                      { onSettled: () => setTagSaving(null) },
                    );
                  }}
                  disabled={tagSaving === t.id}
                  className="cursor-pointer hover:opacity-70 disabled:opacity-50"
                >
                  {tagSaving === t.id ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <X className="h-2.5 w-2.5" />
                  )}
                </button>
              )}
            </span>
          ))}
          {!isArchived && allTags && allTags.length > 0 && (
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  const tagId = e.target.value;
                  if (!tagId) return;
                  setTagSaving(tagId);
                  addTagMutation.mutate(
                    { applicationId: selected.id, tagId },
                    { onSettled: () => setTagSaving(null) },
                  );
                  e.target.value = "";
                }}
                className="h-5 cursor-pointer appearance-none rounded-full border border-dashed border-muted-foreground bg-transparent px-2 text-[11px] text-muted-foreground outline-none transition-colors hover:border-foreground hover:text-foreground"
              >
                <option value="">+ Ajouter</option>
                {allTags
                  .filter((t) => !selected.tags.some((st) => st.id === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

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

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              Localisation
            </label>
            <div className="flex gap-2">
              <input
                value={locationDraft}
                onChange={(e) => setLocationDraft(e.target.value)}
                disabled={isArchived}
                className="h-7 flex-1 rounded-lg border bg-transparent px-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                placeholder="Ville, pays ou télétravail"
              />
              {locationDraft !== (selected.location ?? "") && !isArchived && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={saving === "location"}
                  onClick={handleSaveLocation}
                >
                  {saving === "location" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              Candidaté le{" "}
              {formatDate(selected.applicationDate || selected.createdAt)}
            </span>
          </div>
          {salaryText && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <BriefcaseBusiness className="h-4 w-4 shrink-0" />
              <span>{salaryText}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
						{isFollowUpSuggested && (
							<span className="ml-6 text-[11px] text-amber-600">
								Date relance conseillée
							</span>
						)}
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="date"
                value={followUpDateDraft}
                onChange={(e) => {
                  setFollowUpDateDraft(e.target.value);
                  setIsFollowUpSuggested(false);
                }}
                disabled={isArchived}
                className="h-7 flex-1 rounded-lg border bg-transparent px-2.5 text-sm outline-none transition-colors text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              />
              {followUpDateDraft !== (selected.followUpDate ?? "") &&
                !isArchived && (
                  <Button
                    size="sm"
                    variant="default"
                    disabled={saving === "followUpDate"}
                    onClick={() => {
                      setSaving("followUpDate");
                      setFeedback(null);
                      updateMutation.mutate(
                        {
                          id: selected.id,
                          data: { followUpDate: followUpDateDraft || null },
                        },
                        {
                          onSettled: () => setSaving(null),
                          onSuccess: () => {
                            setFeedback({
                              type: "success",
                              message: "Date de relance mise à jour",
                            });
                          },
                          onError: (e) =>
                            setFeedback({
                              type: "error",
                              message:
                                e instanceof Error
                                  ? e.message
                                  : "Erreur réseau",
                            }),
                        },
                      );
                    }}
                  >
                    {saving === "followUpDate" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
            </div>
          </div>
        </div>

        {selected.sourceUrl && (
          <a
            href={selected.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            <Link className="h-3.5 w-3.5" />
            Offre originale
            <ArrowUpRight className="h-3 w-3" />
          </a>
        )}

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Notes
          </label>
          <div className="flex gap-2">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={3}
              disabled={isArchived}
              placeholder="Ajouter des notes..."
              className="flex-1 min-h-16 rounded-lg border bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none disabled:opacity-50"
            />
          </div>
          {notesDraft !== (selected.notes ?? "") && !isArchived && (
            <div className="mt-1.5 flex justify-end">
              <Button
                size="sm"
                variant="default"
                disabled={saving === "notes"}
                onClick={handleSaveNotes}
              >
                {saving === "notes" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Enregistrer
              </Button>
            </div>
          )}
        </div>

        {!isArchived && <DocumentSection applicationId={selected.id} />}

        <div className="flex items-center justify-between border-t pt-4">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
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
            </div>
          ) : (
            <>
              {selected.status === "rejected" && !isArchived && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                  disabled={saving === "status"}
                  onClick={handleRejectAndArchive}
                >
                  {saving === "status" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                  Archiver
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-500/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
