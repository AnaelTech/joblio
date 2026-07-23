import { QueryClientProvider } from "@tanstack/react-query";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { queryClient } from "@/lib/query-client";
import AppSidebar from "./AppSidebar";

interface Props {
	children: React.ReactNode;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
}

function LayoutInner({ children, user }: Props) {
	return (
		<SidebarProvider>
			<AppSidebar user={user} />

			<SidebarInset>
				<header className="flex h-14 items-center gap-2 border-b px-4 safe-area-top">
					<div className="md:hidden">
						<SidebarTrigger />
					</div>

					<span className="font-semibold">Joblio</span>
				</header>

				<main className="overflow-y-auto p-6 safe-area-bottom">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}

export default function AppSidebarLayout({ children, user }: Props) {
	return (
		<QueryClientProvider client={queryClient}>
			<LayoutInner user={user}>{children}</LayoutInner>
		</QueryClientProvider>
	);
}
