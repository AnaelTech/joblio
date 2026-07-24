import { useState, useCallback, useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useApplications } from "@/features/applications/hooks";
import ApplicationTable from "@/features/applications/components/ApplicationTable";
import ApplicationModal from "@/features/applications/components/ApplicationModal";
import type { ApplicationData } from "@/features/applications/components/ApplicationModal";

interface Props {
  initialData: ApplicationData[];
  q?: string;
  status?: string;
  priority?: string;
  archived?: string;
}

function ApplicationsInner({
  initialData,
  q,
  status,
  priority,
  archived,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filters = useMemo(
    () => ({
      q: q || undefined,
      status: status || undefined,
      priority: priority || undefined,
      archived: archived || undefined,
    }),
    [q, status, priority, archived],
  );
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
        <p className="text-center text-muted-foreground py-12">
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

export default function ApplicationsPage({
  initialData,
  q,
  status,
  priority,
  archived,
}: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationsInner
        initialData={initialData}
        q={q}
        status={status}
        priority={priority}
        archived={archived}
      />
    </QueryClientProvider>
  );
}
