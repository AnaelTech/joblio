import { useState, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApplications } from "@/features/applications/hooks";
import ApplicationTable from "@/features/applications/components/ApplicationTable";
import ApplicationModal from "@/features/applications/components/ApplicationModal";
import type { ApplicationData } from "@/features/applications/components/ApplicationModal";

const queryClient = new QueryClient();

interface Props {
	initialData: ApplicationData[];
	archived?: string;
}

function ApplicationsInner({ initialData, archived }: Props) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const filters = useMemo(() => ({ archived: archived || undefined }), [archived]);
	const { data } = useApplications(filters, initialData);
	const applications = data ?? initialData;

	const handleSelect = useCallback((id: string) => {
		setSelectedId(id);
	}, []);

	const handleModalOpenChange = useCallback((open: boolean) => {
		if (!open) setSelectedId(null);
	}, []);

	return (
		<>
			{applications.length > 0 ? (
				<ApplicationTable data={applications} onSelect={handleSelect} />
			) : (
				<p class="text-center text-muted-foreground py-12">
					Aucune candidature trouvée.
				</p>
			)}
			<ApplicationModal
				applications={applications}
				selectedId={selectedId}
				onOpenChange={handleModalOpenChange}
			/>
		</>
	);
}

export default function ApplicationsPage({ initialData, archived }: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<ApplicationsInner initialData={initialData} archived={archived} />
		</QueryClientProvider>
	);
}
