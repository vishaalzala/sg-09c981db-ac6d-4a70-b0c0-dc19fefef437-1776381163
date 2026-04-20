"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    LayoutDashboard,
    Calendar,
    Briefcase,
    FileText,
    Receipt,
    Users,
    Car,
    Package,
    ShoppingCart,
    Bell,
    Settings,
    User,
    LogOut,
    ChevronRight,
    Menu,
    X,
} from "lucide-react";

interface AppLayoutProps {
    children: ReactNode;
    companyId?: string;
    companyName?: string;
    userName?: string;
}

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Quotes", href: "/dashboard/quotes", icon: FileText },
    { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart },
];

export function AppLayout({
    children,
    companyName,
    userName,
}: AppLayoutProps) {
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menuUserName, setMenuUserName] = useState(userName || "User");
    const [menuUserEmail, setMenuUserEmail] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            setMenuUserEmail(user.email || "");

            if (userName) {
                setMenuUserName(userName);
            } else if (user.email) {
                setMenuUserName(user.email.split("@")[0]);
            }
        };

        loadUser();
    }, [userName]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const isActive = (href: string) => {
        return router.pathname === href || router.pathname.startsWith(href + "/");
    };

    const initials = menuUserName
        ?.split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    if (!mounted) return null;

    return (
        <div className="flex h-screen bg-background">
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all",
                    sidebarOpen ? "w-64" : "w-16"
                )}
            >
                <div className="flex h-16 items-center justify-between px-4 border-b">
                    {sidebarOpen && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary rounded" />
                            <span className="font-bold">Workshop</span>
                        </Link>
                    )}

                    <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                                    active
                                        ? "bg-primary text-white"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon size={18} />
                                {sidebarOpen && item.name}
                                {sidebarOpen && active && (
                                    <ChevronRight className="ml-auto" size={16} />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div
                className={cn(
                    "flex-1 transition-all",
                    sidebarOpen ? "ml-64" : "ml-16"
                )}
            >
                <header className="flex items-center justify-between h-16 px-6 border-b bg-background">
                    <div>
                        <h1 className="text-lg font-semibold">
                            {router.pathname === "/dashboard"
                                ? "Dashboard"
                                : router.pathname.split("/").pop()}
                        </h1>
                        {companyName && (
                            <p className="text-sm text-muted-foreground">{companyName}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/dashboard/reminders")}
                            className="relative"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 border rounded px-2 py-1 hover:bg-muted"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{initials || "U"}</AvatarFallback>
                                    </Avatar>

                                    <div className="hidden md:flex flex-col text-left">
                                        <span className="text-sm font-medium">{menuUserName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {menuUserEmail}
                                        </span>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                                    <User size={16} className="mr-2" />
                                    Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                    <Settings size={16} className="mr-2" />
                                    Settings
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut size={16} className="mr-2" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>
        </div>
    );
}