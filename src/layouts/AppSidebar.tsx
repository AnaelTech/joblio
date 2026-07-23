import {
	Bell,
	BriefcaseBusiness,
	Building2,
	Calendar,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	ContactRound,
	LayoutDashboard,
	Settings,
	Tags,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUnreadCount } from "@/features/notifications/hooks";
import { cn } from "@/lib/utils";

const sections = [
	{
		label: "Général",
		items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
	},
	{
		label: "Suivi",
		items: [
			{ title: "Candidatures", url: "/applications", icon: BriefcaseBusiness },
			{ title: "Calendrier", url: "/calendar", icon: Calendar },
			{ title: "Notifications", url: "/notifications", icon: Bell },
			{ title: "Entreprises", url: "/companies", icon: Building2 },
			{ title: "Contacts", url: "/contacts", icon: ContactRound },
			{ title: "Entretiens", url: "/interviews", icon: CalendarDays },
		],
	},
	{
		label: "Configuration",
		items: [{ title: "Tags", url: "/tags", icon: Tags }],
	},
];

const allItems = sections.flatMap((s) => s.items);

const allNavItems = [
	...allItems,
	{ title: "Paramètres", url: "/settings", icon: Settings },
];

function useActivePath() {
	const [path, setPath] = useState("");
	useEffect(() => {
		setPath(window.location.pathname);
	}, []);
	return path;
}

function NavItem({
	icon: Icon,
	title,
	url,
	collapsed,
	isActive,
	badge,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	url: string;
	collapsed: boolean;
	isActive: boolean;
	badge?: number;
}) {
	const inner = (
		<a
			href={url}
			aria-label={collapsed ? title : undefined}
			className={cn(
				"relative flex items-center rounded-xl transition-all duration-150",
				collapsed ? "mx-auto size-10 justify-center" : "h-11 w-full gap-3 px-3",
				isActive
					? "bg-sidebar-accent text-primary font-medium"
					: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			)}
		>
			<div className="relative shrink-0">
				<Icon className="size-5" />
				{collapsed && badge !== undefined && badge > 0 && (
					<span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-red-500 ring-2 ring-sidebar" />
				)}
			</div>
			{!collapsed && <span className="truncate text-sm">{title}</span>}
			{!collapsed && badge !== undefined && badge > 0 && (
				<span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-5 text-white">
					{badge > 99 ? "99+" : badge}
				</span>
			)}
		</a>
	);

	if (collapsed) {
		return (
			<Tooltip closeDelay={0}>
				<TooltipTrigger render={<span />}>{inner}</TooltipTrigger>
				<TooltipContent
					side="right"
					sideOffset={8}
					className="rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background"
				>
					{title}
				</TooltipContent>
			</Tooltip>
		);
	}

	return inner;
}

interface SidebarProps {
	user?: {
		id: string;
		name: string;
		email: string;
	} | null;
}

function SidebarInner({ user }: SidebarProps) {
	const { state, open, setOpen, setOpenMobile, isMobile } = useSidebar();
	const activePath = useActivePath();
	const collapsed = !isMobile && state === "collapsed";
	const { data: unreadCount } = useUnreadCount();

	function notificationBadge(title: string) {
		return title === "Notifications" ? unreadCount : undefined;
	}

	const handleToggle = useCallback(() => {
		setOpen(!open);
	}, [open, setOpen]);

	return (
		<Sidebar collapsible="icon" variant="floating" className="bg-sidebar">
			<div
				className={cn(
					"flex h-full w-full flex-col",
					collapsed ? "items-center" : "",
				)}
			>
				{/* Header */}
				<div
					className={cn(
						"flex shrink-0 items-center border-b border-sidebar-border transition-all",
						collapsed
							? "h-[120px] w-full flex-col justify-start gap-3 pt-5 px-0"
							: "h-[72px] gap-3 px-4",
					)}
				>
					<div className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
						J
					</div>
					{!collapsed && (
						<>
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="truncate text-sm font-semibold text-sidebar-foreground">
									Joblio
								</span>
								<span className="truncate text-xs text-sidebar-foreground/60">
									{user?.name ?? "Recruteur"}
								</span>
							</div>
							{!isMobile && (
								<button
									onClick={handleToggle}
									aria-label="Réduire la barre latérale"
									className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								>
									<ChevronLeft className="size-4" />
								</button>
							)}
							{isMobile && (
								<button
									onClick={() => setOpenMobile(false)}
									aria-label="Fermer la barre latérale"
									className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
								>
									<X className="size-4" />
								</button>
							)}
						</>
					)}
					{collapsed && !isMobile && (
						<button
							onClick={handleToggle}
							aria-label="Développer la barre latérale"
							className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						>
							<ChevronRight className="size-4" />
						</button>
					)}
				</div>

				{/* Content */}
				<div
					className={cn(
						"flex-1 overflow-y-auto",
						collapsed ? "px-2 py-4" : "px-3 py-4",
					)}
				>
					{collapsed ? (
						<nav className="flex flex-col items-center gap-2">
							{allNavItems.map((item) => (
								<NavItem
									key={item.title}
									{...item}
									collapsed
									isActive={activePath === item.url}
									badge={notificationBadge(item.title)}
								/>
							))}
						</nav>
					) : (
						<nav className="flex flex-col gap-1">
							{sections.map((section) => (
								<div key={section.label} className="flex flex-col">
									<span className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
										{section.label}
									</span>
									<div className="flex flex-col gap-1">
										{section.items.map((item) => (
											<NavItem
												key={item.title}
												{...item}
												collapsed={false}
												isActive={activePath === item.url}
												badge={notificationBadge(item.title)}
											/>
										))}
									</div>
								</div>
							))}
						</nav>
					)}
				</div>

				{/* Footer */}
				{!collapsed && (
					<div className="shrink-0 border-t border-sidebar-border px-3 py-3">
						<NavItem
							icon={Settings}
							title="Paramètres"
							url="/settings"
							collapsed={false}
							isActive={activePath === "/settings"}
						/>
					</div>
				)}
			</div>
		</Sidebar>
	);
}

export default function AppSidebar(props: SidebarProps) {
	return <SidebarInner {...props} />;
}
