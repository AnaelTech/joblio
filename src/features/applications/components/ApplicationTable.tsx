import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	type SortingState,
	type ColumnDef,
} from "@tanstack/react-table";
import { useState } from "react";
import { MapPin, Star, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
	STATUS_LABELS,
	STATUS_COLORS,
	PRIORITY_LABELS,
	PRIORITY_COLORS,
} from "@/features/applications/constants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ApplicationData, ApplicationTag } from "./ApplicationModal";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
	data: ApplicationData[];
	onSelect: (id: string) => void;
}

export default function ApplicationTable({ data, onSelect }: Props) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<ApplicationData>[] = [
		{
			id: "favorite",
			header: "",
			cell: () => (
				<button
					className="flex cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-amber-400"
					aria-label="Ajouter aux favoris"
				>
					<Star className="h-4 w-4" />
				</button>
			),
			size: 32,
		},
		{
			accessorKey: "companyName",
			header: "Entreprise",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
						{row.original.companyName.charAt(0).toUpperCase()}
					</div>
					<span className="font-medium">{row.original.companyName}</span>
				</div>
			),
		},
		{
			accessorKey: "title",
			header: "Poste",
			cell: ({ row }) => <span className="text-sm">{row.original.title}</span>,
		},
		{
			accessorKey: "status",
			header: "Statut",
			cell: ({ row }) => (
				<span
					className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${STATUS_COLORS[row.original.status] ?? "bg-muted text-muted-foreground"}`}
				>
					{STATUS_LABELS[row.original.status] ?? row.original.status}
				</span>
			),
		},
		{
			accessorKey: "priority",
			header: "Priorité",
			cell: ({ row }) => (
				<span
					className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${PRIORITY_COLORS[row.original.priority] ?? "bg-muted text-muted-foreground"}`}
				>
					{PRIORITY_LABELS[row.original.priority] ?? row.original.priority}
				</span>
			),
		},
		{
			accessorKey: "tags",
			header: "Tags",
			cell: ({ row }) => {
				const appTags: ApplicationTag[] = row.original.tags ?? [];
				if (appTags.length === 0)
					return <span className="text-muted-foreground">—</span>;
				return (
					<div className="flex flex-wrap gap-1">
						{appTags.slice(0, 3).map((t) => (
							<span
								key={t.id}
								className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium"
								style={{
									backgroundColor: t.color ? `${t.color}20` : undefined,
									color: t.color ?? undefined,
								}}
							>
								{t.name}
							</span>
						))}
						{appTags.length > 3 && (
							<span className="text-[11px] text-muted-foreground">
								+{appTags.length - 3}
							</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "location",
			header: "Localisation",
			cell: ({ row }) => {
				const app = row.original;
				const loc = app.location ?? app.remoteType;
				return loc ? (
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<MapPin className="h-3.5 w-3.5 shrink-0" />
						<span className="truncate">{loc}</span>
					</div>
				) : (
					<span className="text-muted-foreground">—</span>
				);
			},
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<button
					className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Date
					{column.getIsSorted() === "asc" ? (
						<ArrowUp className="h-3 w-3" />
					) : column.getIsSorted() === "desc" ? (
						<ArrowDown className="h-3 w-3" />
					) : (
						<ArrowUpDown className="h-3 w-3" />
					)}
				</button>
			),
			cell: ({ row }) => {
				const d = row.original.createdAt;
				return d ? (
					<span className="text-muted-foreground">
						{format(new Date(d), "dd MMM yyyy", { locale: fr })}
					</span>
				) : (
					<span className="text-muted-foreground">—</span>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<>
			{/* Mobile cards */}
			<div className="flex flex-col gap-3 md:hidden">
				{data.map((app) => (
					<Card
						key={app.id}
						data-application-id={app.id}
						onClick={() => onSelect(app.id)}
					>
						<CardContent className="flex items-start gap-3 p-3">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
								{app.companyName.charAt(0).toUpperCase()}
							</div>
							<div className="flex min-w-0 flex-1 flex-col gap-1.5">
								<div className="min-w-0">
									<p className="truncate text-sm font-medium">
										{app.companyName}
									</p>
									<p className="truncate text-sm text-muted-foreground">
										{app.title}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-1.5">
									<span
										className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${STATUS_COLORS[app.status] ?? "bg-muted text-muted-foreground"}`}
									>
										{STATUS_LABELS[app.status] ?? app.status}
									</span>
									<span
										className={`inline-flex h-5 items-center rounded-full px-2 text-xs font-medium ${PRIORITY_COLORS[app.priority] ?? "bg-muted text-muted-foreground"}`}
									>
										{PRIORITY_LABELS[app.priority] ?? app.priority}
									</span>
									{app.tags?.slice(0, 3).map((t) => (
										<span
											key={t.id}
											className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium"
											style={{
												backgroundColor: t.color ? `${t.color}20` : undefined,
												color: t.color ?? undefined,
											}}
										>
											{t.name}
										</span>
									))}
									{(app.location || app.remoteType) && (
										<span className="flex items-center gap-1 text-xs text-muted-foreground">
											<MapPin className="h-3 w-3" />
											{app.location ?? app.remoteType}
										</span>
									)}
								</div>
								<p className="text-xs text-muted-foreground">
									{app.createdAt
										? format(new Date(app.createdAt), "dd MMM yyyy", {
												locale: fr,
											})
										: "—"}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Desktop table */}
			<div className="hidden md:block">
				<Card>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-application-id={row.original.id}
										onClick={() => onSelect(row.original.id)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
