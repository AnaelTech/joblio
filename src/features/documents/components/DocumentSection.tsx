import { useState, useRef, useEffect } from "react";
import {
	FileText,
	Upload,
	Trash2,
	Loader2,
	File,
	ExternalLink,
	X,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import {
	DOCUMENT_TYPE_LABELS,
	DOCUMENT_TYPES,
} from "@/features/documents/schema";
import {
	useDocuments,
	useUploadDocument,
	useDeleteDocument,
} from "@/features/documents/hooks";
import type { DocumentResponse } from "@/features/documents/api";
import { Button } from "@/components/ui/button";

interface Props {
	applicationId: string;
}

const PREVIEW_TYPES = [
	"application/pdf",
	"image/png",
	"image/jpeg",
	"image/webp",
];

function FeedbackMessage({
	type,
	message,
	onDismiss,
}: {
	type: "success" | "error";
	message: string;
	onDismiss: () => void;
}) {
	useEffect(() => {
		const timer = setTimeout(onDismiss, 4000);
		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<div
			className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
				type === "success"
					? "bg-green-500/10 text-green-600"
					: "bg-red-500/10 text-red-600"
			}`}
		>
			{type === "success" ? (
				<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
			) : (
				<AlertCircle className="h-3.5 w-3.5 shrink-0" />
			)}
			<span className="flex-1">{message}</span>
			<button
				onClick={onDismiss}
				className="ml-1 rounded p-0.5 transition-colors hover:bg-black/10"
				aria-label="Fermer"
			>
				<X className="h-3 w-3" />
			</button>
		</div>
	);
}

function DocumentPreview({ doc }: { doc: DocumentResponse }) {
	const [open, setOpen] = useState(false);

	if (!open) {
		return (
			<button
				onClick={() => setOpen(true)}
				className="inline-flex h-7 items-center gap-1 rounded-md border border-input bg-transparent px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				<FileText className="h-3 w-3" />
				Aperçu
			</button>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
			<div className="relative flex max-h-dvh w-full max-w-2xl flex-col rounded-xl bg-card shadow-xl sm:max-h-[90vh]">
				<div className="flex items-center justify-between border-b px-4 py-2">
					<span className="truncate text-sm font-medium">{doc.filename}</span>
					<button
						onClick={() => setOpen(false)}
						className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						aria-label="Fermer"
					>
						<X className="size-4" />
					</button>
				</div>
				<div className="flex min-h-0 flex-1 items-center justify-center p-2">
					{doc.mimeType === "application/pdf" ? (
						<embed
							src={doc.storagePath}
							type="application/pdf"
							className="h-full w-full"
						/>
					) : (
						<img
							src={doc.storagePath}
							alt={doc.filename}
							className="max-h-full max-w-full object-contain"
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function DocumentRow({
	doc,
	onDelete,
	deleting,
}: {
	doc: DocumentResponse;
	onDelete: () => void;
	deleting: boolean;
}) {
	const canPreview = doc.mimeType && PREVIEW_TYPES.includes(doc.mimeType);

	return (
		<div className="flex min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2">
			<File className="size-4 shrink-0 text-muted-foreground" />
			<div className="min-w-0 flex-1 overflow-hidden">
				<div className="flex min-w-0 items-center gap-1.5">
					<span className="min-w-0 truncate text-sm">{doc.filename}</span>
					<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
						{DOCUMENT_TYPE_LABELS[doc.type] ?? doc.type}
					</span>
				</div>
				{doc.size && (
					<p className="text-[11px] text-muted-foreground">
						{(doc.size / 1024).toFixed(1)} Ko
					</p>
				)}
			</div>
			<div className="flex shrink-0 items-center gap-1">
				{canPreview && <DocumentPreview doc={doc} />}
				<a
					href={doc.storagePath}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Télécharger"
				>
					<ExternalLink className="size-3.5" />
				</a>
				<button
					onClick={onDelete}
					disabled={deleting}
					className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
					aria-label="Supprimer"
				>
					{deleting ? (
						<Loader2 className="size-3.5 animate-spin" />
					) : (
						<Trash2 className="size-3.5" />
					)}
				</button>
			</div>
		</div>
	);
}

export default function DocumentSection({ applicationId }: Props) {
	const [uploading, setUploading] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [docType, setDocType] = useState("resume");
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	const { data: docs = [], isLoading } = useDocuments(applicationId);
	const uploadMutation = useUploadDocument();
	const deleteMutation = useDeleteDocument();

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		setFeedback(null);
		uploadMutation.mutate(
			{ applicationId, type: docType, file },
			{
				onSuccess: () => {
					setFeedback({ type: "success", message: "Document ajouté" });
				},
				onError: () => {
					setFeedback({ type: "error", message: "Erreur lors de l'ajout" });
				},
				onSettled: () => {
					setUploading(false);
					if (fileRef.current) fileRef.current.value = "";
				},
			},
		);
	};

	const handleDelete = (docId: string) => {
		setDeleteId(docId);
		setFeedback(null);
		deleteMutation.mutate(
			{ applicationId, docId },
			{
				onSuccess: () => {
					setFeedback({ type: "success", message: "Document supprimé" });
				},
				onError: () => {
					setFeedback({
						type: "error",
						message: "Erreur lors de la suppression",
					});
				},
				onSettled: () => setDeleteId(null),
			},
		);
	};

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
				<FileText className="h-3.5 w-3.5" />
				Documents
			</label>

			{feedback && (
				<FeedbackMessage
					type={feedback.type}
					message={feedback.message}
					onDismiss={() => setFeedback(null)}
				/>
			)}

			{isLoading ? (
				<div className="flex items-center justify-center py-4">
					<Loader2 className="size-5 animate-spin text-muted-foreground" />
				</div>
			) : docs.length > 0 ? (
				<div className="flex min-w-0 flex-col gap-2">
					{docs.map((doc) => (
						<DocumentRow
							key={doc.id}
							doc={doc}
							onDelete={() => handleDelete(doc.id)}
							deleting={deleteId === doc.id}
						/>
					))}
				</div>
			) : (
				<p className="py-2 text-xs text-muted-foreground">
					Aucun document ajouté
				</p>
			)}

			<div className="flex items-center gap-2 max-sm:flex-wrap">
				<select
					value={docType}
					onChange={(e) => setDocType(e.target.value)}
					disabled={uploading}
					className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
				>
					{DOCUMENT_TYPES.map((t) => (
						<option key={t} value={t}>
							{DOCUMENT_TYPE_LABELS[t]}
						</option>
					))}
				</select>
				<input
					ref={fileRef}
					type="file"
					accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
					onChange={handleFileChange}
					className="hidden"
					aria-label="Ajouter un fichier"
				/>
				<Button
					size="sm"
					variant="outline"
					disabled={uploading}
					onClick={() => fileRef.current?.click()}
				>
					{uploading ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Upload className="h-3.5 w-3.5" />
					)}
					Ajouter
				</Button>
			</div>
			<p className="text-[10px] text-muted-foreground">
				Max. 10 Mo — PDF, PNG, JPG, WebP, DOC, DOCX, TXT
			</p>
		</div>
	);
}
