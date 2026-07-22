import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContacts, updateContactApi, deleteContactApi } from "./api";
import type { ContactRow } from "./queries";

const CONTACTS_KEY = "contacts";

export function useContacts(
	filters: { q?: string; companyId?: string },
	initialData?: ContactRow[],
) {
	return useQuery({
		queryKey: [CONTACTS_KEY, filters],
		queryFn: () => fetchContacts(filters),
		initialData,
	});
}

export function useUpdateContact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Record<string, unknown>;
		}) => updateContactApi(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CONTACTS_KEY] });
		},
	});
}

export function useDeleteContact() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteContactApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [CONTACTS_KEY] });
		},
	});
}
