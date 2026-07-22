import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";

import AppSidebar from "./AppSidebar";

interface Props {
	children: React.ReactNode;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
}

export default function AppSidebarLayout({ children, user }: Props) {
	return (
		<SidebarProvider>
			<AppSidebar user={user} />

			<SidebarInset>
				<header className="flex h-14 items-center gap-2 border-b px-4">
					<div className="md:hidden">
						<SidebarTrigger />
					</div>

					<span className="font-semibold">Joblio</span>
				</header>

				<main className="p-6">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
