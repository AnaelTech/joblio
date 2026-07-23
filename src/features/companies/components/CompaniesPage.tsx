import { useState, useCallback, useMemo, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { useCompanies } from "@/features/companies/hooks";
import CompanyModal from "@/features/companies/components/CompanyModal";
import type { CompanyData } from "@/features/companies/components/CompanyModal";
import { ExternalLink, Globe, MapPin, CheckCircle } from "lucide-react";

interface Props {
	initialData: CompanyData[];
	q?: string;
}

function CompaniesInner({ initialData, q }: Props) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const filters = useMemo(() => ({ q: q || undefined }), [q]);
	const { data } = useCompanies(filters, initialData);
	const companies = data ?? initialData;

	const handleRowClick = useCallback((id: string) => {
		setSelectedId(id);
	}, []);

	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 2000);
		return () => clearTimeout(t);
	}, [toast]);

	if (companies.length === 0) return null;

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b text-left text-sm text-muted-foreground">
							<th className="py-3 pr-4 font-medium">Entreprise</th>
							<th className="hidden py-3 pr-4 font-medium md:table-cell">
								Secteur
							</th>
							<th className="hidden py-3 pr-4 font-medium sm:table-cell">
								Localisation
							</th>
							<th className="hidden py-3 pr-4 font-medium lg:table-cell">
								Site web
							</th>
							<th className="hidden py-3 pr-4 font-medium lg:table-cell">
								LinkedIn
							</th>
						</tr>
					</thead>
					<tbody>
						{companies.map((c) => (
							<tr
								key={c.id}
								className="cursor-pointer border-b transition-colors hover:bg-muted/50"
								onClick={() => handleRowClick(c.id)}
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleRowClick(c.id);
								}}
							>
								<td className="py-3 pr-4">
									<div className="flex items-center gap-2">
										<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
											{c.name.charAt(0).toUpperCase()}
										</div>
										<div className="min-w-0">
											<div className="truncate font-medium">{c.name}</div>
											<div className="text-xs text-muted-foreground sm:hidden">
												{c.industry ?? ""}
												{c.industry && c.location ? " · " : ""}
												{c.location ?? ""}
											</div>
										</div>
									</div>
								</td>
								<td className="hidden py-3 pr-4 text-muted-foreground md:table-cell">
									{c.industry ?? "—"}
								</td>
								<td className="hidden py-3 pr-4 sm:table-cell">
									<div className="flex items-center gap-1 text-sm text-muted-foreground">
										<MapPin className="h-3.5 w-3.5 shrink-0" />
										<span>{c.location ?? "—"}</span>
									</div>
								</td>
								<td className="hidden py-3 pr-4 lg:table-cell">
									{c.website ? (
										<a
											href={c.website}
											target="_blank"
											rel="noopener noreferrer"
											onClick={(e) => e.stopPropagation()}
											className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
										>
											<Globe className="h-3.5 w-3.5" />
											<span className="max-w-[160px] truncate">
												{c.website.replace(/^https?:\/\//, "")}
											</span>
										</a>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>
								<td className="hidden py-3 pr-4 lg:table-cell">
									{c.linkedin ? (
										<a
											href={c.linkedin}
											target="_blank"
											rel="noopener noreferrer"
											onClick={(e) => e.stopPropagation()}
											className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
										>
											<ExternalLink className="h-3.5 w-3.5" />
											<span className="max-w-[160px] truncate">LinkedIn</span>
										</a>
									) : (
										<span className="text-muted-foreground">—</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<CompanyModal
				companies={companies}
				selectedId={selectedId}
				onOpenChange={(open) => {
					if (!open) setSelectedId(null);
				}}
				onDeleted={(name) => setToast(`"${name}" a été supprimée`)}
			/>

			{toast && (
				<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm text-white shadow-lg animate-in slide-in-from-bottom-2">
					<CheckCircle className="h-4 w-4 shrink-0" />
					{toast}
				</div>
			)}
		</>
	);
}

export default function CompaniesPage({ initialData, q }: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<CompaniesInner initialData={initialData} q={q} />
		</QueryClientProvider>
	);
}
