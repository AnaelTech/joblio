import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchApplications,
	updateApplicationApi,
	deleteApplicationApi,
	addApplicationTagApi,
	removeApplicationTagApi,
	fetchAllTags,
} from "./api";
import type { ApplicationData } from "./components/ApplicationModal";

const APPLICATIONS_KEY = "applications";
const TAGS_KEY = "allTags";

export function useApplications(
	filters: { q?: string; status?: string; priority?: string; archived?: string },
	initialData?: ApplicationData[],
) {
	return useQuery({
		queryKey: [APPLICATIONS_KEY, filters],
		queryFn: () => fetchApplications(filters),
		initialData,
	});
}

export function useAllTags() {
	return useQuery({
		queryKey: [TAGS_KEY],
		queryFn: fetchAllTags,
		staleTime: 60000,
	});
}

export function useUpdateApplication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Record<string, unknown>;
		}) => updateApplicationApi(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
		},
	});
}

export function useDeleteApplication() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteApplicationApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
		},
	});
}

export function useAddApplicationTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			applicationId,
			tagId,
		}: {
			applicationId: string;
			tagId: string;
		}) => addApplicationTagApi(applicationId, tagId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
		},
	});
}

export function useRemoveApplicationTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			applicationId,
			tagId,
		}: {
			applicationId: string;
			tagId: string;
		}) => removeApplicationTagApi(applicationId, tagId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });
		},
	});
}
