import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	FileText,
	Menu,
	X,
	Sparkles,
	ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
	children: ReactNode;
}

const navigation = [
	{ name: "Dashboard", href: "/", icon: LayoutDashboard },
	{ name: "Vendors", href: "/vendors", icon: Users },
];

const Layout = ({ children }: LayoutProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const location = useLocation();

	return (
		<div className="min-h-screen bg-background">
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
						<Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
					</div>
					<div>
						<h1 className="text-sm font-semibold text-sidebar-primary-foreground">
							RFP Manager
						</h1>
						<p className="text-xs text-sidebar-foreground/60">AI-Powered</p>
					</div>
				</div>

				<nav className="flex-1 px-3 py-4 space-y-1">
					{navigation.map((item) => {
						const isActive = location.pathname === item.href;
						return (
							<Link
								key={item.name}
								to={item.href}
								onClick={() => setSidebarOpen(false)}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
									isActive
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
								)}
							>
								<item.icon className="h-5 w-5" />
								{item.name}
								{isActive && (
									<ChevronRight className="ml-auto h-4 w-4 text-sidebar-primary" />
								)}
							</Link>
						);
					})}
				</nav>

				<div className="p-4 border-t border-sidebar-border">
					<div className="flex items-center gap-3 px-2">
						<div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
							<span className="text-xs font-medium text-sidebar-accent-foreground">
								PM
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-sidebar-foreground truncate">
								Procurement Manager
							</p>
							<p className="text-xs text-sidebar-foreground/60 truncate">
								Admin
							</p>
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div className="lg:pl-64">
				<main className="flex-1">{children}</main>
			</div>
		</div>
	);
};

export default Layout;
