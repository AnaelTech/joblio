import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInterviews, updateInterviewApi, deleteInterviewApi } from "./api";
import type { InterviewRow } from "./queries";

const INTERVIEWS_KEY = "interviews";

export function useInterviews(
	filters: { q?: string; result?: string },
	initialData?: InterviewRow[],
) {
	return useQuery({
		queryKey: [INTERVIEWS_KEY, filters],
		queryFn: () => fetchInterviews(filters),
		initialData,
	});
}

export function useUpdateInterview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Record<string, unknown>;
		}) => updateInterviewApi(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [INTERVIEWS_KEY] });
		},
	});
}

export function useDeleteInterview() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteInterviewApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [INTERVIEWS_KEY] });
		},
	});
}
