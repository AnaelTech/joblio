import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDocuments, uploadDocumentApi, deleteDocumentApi } from "./api";

const DOCUMENTS_KEY = "documents";

export function useDocuments(applicationId: string | null) {
	return useQuery({
		queryKey: [DOCUMENTS_KEY, applicationId],
		queryFn: () => fetchDocuments(applicationId!),
		enabled: !!applicationId,
	});
}

export function useUploadDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			applicationId,
			type,
			file,
		}: {
			applicationId: string;
			type: string;
			file: File;
		}) => uploadDocumentApi(applicationId, type, file),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: [DOCUMENTS_KEY, variables.applicationId],
			});
		},
	});
}

export function useDeleteDocument() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			applicationId,
			docId,
		}: {
			applicationId: string;
			docId: string;
		}) => deleteDocumentApi(applicationId, docId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: [DOCUMENTS_KEY, variables.applicationId],
			});
		},
	});
}
