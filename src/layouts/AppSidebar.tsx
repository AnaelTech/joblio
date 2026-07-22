import { useState, useEffect, useCallback } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ContactRound,
  LayoutDashboard,
  Settings,
  Tags,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  url: string;
  collapsed: boolean;
  isActive: boolean;
}) {
  const inner = (
    <a
      href={url}
      aria-label={collapsed ? title : undefined}
      className={cn(
        "flex items-center rounded-xl transition-all duration-150",
        collapsed ? "mx-auto size-10 justify-center" : "h-11 w-full gap-3 px-3",
        isActive
          ? "bg-sidebar-accent text-primary font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate text-sm">{title}</span>
        </>
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

function SidebarInner() {
  const { state, open, setOpen, setOpenMobile, isMobile } = useSidebar();
  const activePath = useActivePath();
  const collapsed = !isMobile && state === "collapsed";

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
                  Recruteur
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

export default function AppSidebar() {
  return <SidebarInner />;
}
