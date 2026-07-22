import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTagApi, fetchTags, updateTagApi } from "./api";
import type { TagRow } from "./queries";

const TAGS_KEY = "tags";

export function useTags(placeholderData?: TagRow[]) {
  return useQuery({
    queryKey: [TAGS_KEY],
    queryFn: () => fetchTags(),
    placeholderData,
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateTagApi(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: [TAGS_KEY] });
      const previous = queryClient.getQueryData<TagRow[]>([TAGS_KEY]);
      queryClient.setQueryData<TagRow[]>([TAGS_KEY], (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData([TAGS_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
    },
  });
}

export function useDeleteTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteTagApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TAGS_KEY] });
		},
	});
}
