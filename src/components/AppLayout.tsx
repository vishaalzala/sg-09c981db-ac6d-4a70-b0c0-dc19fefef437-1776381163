"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Calendar, Briefcase, FileText, Receipt, Users, Car, Package, Bell, Settings, User, LogOut, ChevronRight, Menu, X, Wrench, ShieldCheck, Truck, BarChart3, Clock3 } from "lucide-react";

interface AppLayoutProps { children: ReactNode; companyId?: string; companyName?: string; userName?: string; }
const navigationSections = [
    { title: "Overview", items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
    {
        title: "Operations", items: [
            { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
            { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
            { name: "Quotes", href: "/dashboard/quotes", icon: FileText },
            { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
            { name: "WOF", href: "/dashboard/wof", icon: ShieldCheck },
            { name: "Reminders", href: "/dashboard/reminders", icon: Clock3 },
        ]
    },
    {
        title: "CRM", items: [
            { name: "Customers", href: "/dashboard/customers", icon: Users },
            { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
        ]
    },
    {
        title: "Stock & Suppliers", items: [
            { name: "Inventory", href: "/dashboard/inventory", icon: Package },
            { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
        ]
    },
    { title: "Insights", items: [{ name: "Reports", href: "/dashboard/reports", icon: BarChart3 }] },
    { title: "System", items: [{ name: "Settings", href: "/dashboard/settings", icon: Settings }] },
];
export function AppLayout({ children, companyName, userName }: AppLayoutProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menuUserName, setMenuUserName] = useState(userName || "User");
    const [menuUserEmail, setMenuUserEmail] = useState("");
    useEffect(() => setMounted(true), []);
    useEffect(() => { const loadUser = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; setMenuUserEmail(user.email || ""); setMenuUserName(userName || user.email?.split("@")[0] || "User"); }; loadUser(); }, [userName]);
    const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/login"); };
    const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(`${href}/`);
    const initials = useMemo(() => menuUserName?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(), [menuUserName]);
    if (!mounted) return null;
    return <div className="flex min-h-screen bg-slate-50/60"><aside className={cn("fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-white/95 backdrop-blur transition-all duration-200", sidebarOpen ? "w-72" : "w-20")}><div className="flex h-16 items-center justify-between border-b border-slate-200 px-4"><Link href="/dashboard" className="flex items-center gap-3 overflow-hidden"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm"><Wrench className="h-5 w-5" /></div>{sidebarOpen && <div><p className="text-sm font-semibold text-slate-900">WorkshopPro</p><p className="text-xs text-slate-500">Service workspace</p></div>}</Link><button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100">{sidebarOpen ? <X size={18} /> : <Menu size={18} />}</button></div><ScrollArea className="h-[calc(100vh-64px)]"><div className="space-y-6 p-4">{navigationSections.map((section) => <div key={section.title}>{sidebarOpen && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{section.title}</p>}<div className="space-y-1.5">{section.items.map((item) => { const Icon = item.icon; const active = isActive(item.href); return <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition", active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}><Icon size={18} className={cn(active ? "text-white" : "text-slate-500 group-hover:text-slate-900")} />{sidebarOpen && <><span className="font-medium">{item.name}</span>{active && <ChevronRight className="ml-auto h-4 w-4" />}</>}</Link>; })}</div></div>)}</div></ScrollArea></aside><div className={cn("flex-1 transition-all duration-200", sidebarOpen ? "ml-72" : "ml-20")}><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur"><div><h1 className="text-lg font-semibold capitalize text-slate-900">{router.pathname === "/dashboard" ? "Dashboard" : router.pathname.split("/").pop()?.replace(/-/g, " ")}</h1>{companyName && <p className="text-sm text-slate-500">{companyName}</p>}</div><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/reminders")} className="relative rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /></Button><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:bg-slate-50"><Avatar className="h-9 w-9"><AvatarFallback>{initials || "U"}</AvatarFallback></Avatar><div className="hidden md:block"><p className="text-sm font-medium text-slate-900">{menuUserName}</p><p className="text-xs text-slate-500">{menuUserEmail}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push("/dashboard/profile")}><User size={16} className="mr-2" />Profile</DropdownMenuItem><DropdownMenuItem onClick={() => router.push("/dashboard/settings")}><Settings size={16} className="mr-2" />Settings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={handleSignOut}><LogOut size={16} className="mr-2" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header><main className="min-h-[calc(100vh-64px)] p-6">{children}</main></div></div>;
}
