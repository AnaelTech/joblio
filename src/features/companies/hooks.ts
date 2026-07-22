import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCompanies, updateCompanyApi, deleteCompanyApi } from "./api";
import type { CompanyRow } from "./queries";

const COMPANIES_KEY = "companies";

export function useCompanies(
	filters: { q?: string },
	initialData?: CompanyRow[],
) {
	return useQuery({
		queryKey: [COMPANIES_KEY, filters],
		queryFn: () => fetchCompanies(filters),
		initialData,
	});
}

export function useUpdateCompany() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Record<string, unknown>;
		}) => updateCompanyApi(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });
		},
	});
}

export function useDeleteCompany() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteCompanyApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [COMPANIES_KEY] });
		},
	});
}
