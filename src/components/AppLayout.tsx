"use client";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Calendar, ClipboardCheck, Briefcase, FileText, Receipt, Users, Car, Package, Bell, Settings, User, LogOut, ChevronRight, Menu, X, Wrench, ShieldCheck, Truck, BarChart3, Clock3, CreditCard, MessageSquare, HeartHandshake } from "lucide-react";

interface AppLayoutProps { children: ReactNode; companyId?: string; companyName?: string; userName?: string; }
type NavigationLayout = "vertical" | "horizontal";
const STORAGE_KEY = "workshoppro:nav-layout";

const sections = [
    { title: "Overview", items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
    {
        title: "Operations", items: [
            { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
            { name: "Check-In", href: "/checkin", icon: ClipboardCheck },
            { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
            { name: "Quotes", href: "/dashboard/quotes", icon: FileText },
            { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
            { name: "WOF", href: "/dashboard/wof", icon: ShieldCheck },
            { name: "Service Reminders", href: "/dashboard/service-schedules", icon: Bell },
            { name: "Reminders", href: "/dashboard/reminders", icon: Clock3 },
        ]
    },
    {
        title: "CRM", items: [
            { name: "Customers", href: "/dashboard/customers", icon: Users },
            { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
            { name: "Staff", href: "/dashboard/staff", icon: Users },
        ]
    },
    {
        title: "Stock & Suppliers", items: [
            { name: "Inventory", href: "/dashboard/inventory", icon: Package },
            { name: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
        ]
    },
    {
        title: "Growth", items: [
            { name: "Communications", href: "/dashboard/communications", icon: MessageSquare },
            { name: "Marketing", href: "/dashboard/marketing", icon: MessageSquare },
            { name: "Loyalty", href: "/dashboard/loyalty", icon: HeartHandshake },
        ]
    },
    { title: "Insights", items: [{ name: "Reports", href: "/dashboard/reports", icon: BarChart3 }] },
    {
        title: "System", items: [
            { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
            { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ]
    },
] as const;
const flatNav = sections.flatMap((s) => s.items);
const titleFromPath = (pathname: string) => pathname === "/dashboard" ? "Dashboard" : (pathname.split("/").filter(Boolean).pop() || "dashboard").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function AppLayout({ children, companyName, userName }: AppLayoutProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menuUserName, setMenuUserName] = useState(userName || "User");
    const [menuUserEmail, setMenuUserEmail] = useState("");
    const [navigationLayout, setNavigationLayout] = useState < NavigationLayout > ("vertical");

    useEffect(() => { setMounted(true); const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null; if (saved === "vertical" || saved === "horizontal") setNavigationLayout(saved); }, []);
    useEffect(() => { const load = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; setMenuUserEmail(user.email || ""); setMenuUserName(userName || user.email?.split("@")[0] || "User"); const company = await companyService.getCurrentCompany().catch(() => null); if (!company?.id) return; const { data } = await (supabase as any).from("company_settings").select("settings_payload").eq("company_id", company.id).maybeSingle(); const layout = data?.settings_payload?.templates?.navigationLayout; if (layout === "vertical" || layout === "horizontal") { setNavigationLayout(layout); localStorage.setItem(STORAGE_KEY, layout); } }; void load(); }, [userName]);
    const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/login"); };
    const isActive = (href: string) => router.pathname === href || (href !== "/dashboard" && router.pathname.startsWith(`${href}/`));
    const initials = useMemo(() => menuUserName?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(), [menuUserName]);
    if (!mounted) return null;

    const userMenu = <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:bg-slate-50"><Avatar className="h-9 w-9"><AvatarFallback>{initials || "U"}</AvatarFallback></Avatar><div className="hidden md:block"><p className="text-sm font-medium text-slate-900">{menuUserName}</p><p className="text-xs text-slate-500">{menuUserEmail}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>My Account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => router.push('/dashboard/profile')}><User size={16} className="mr-2" />Profile</DropdownMenuItem><DropdownMenuItem onClick={() => router.push('/dashboard/settings')}><Settings size={16} className="mr-2" />Settings</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={handleSignOut}><LogOut size={16} className="mr-2" />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;

    if (navigationLayout === "horizontal") {
        return <div className="min-h-screen bg-slate-50"><header className="sticky top-0 z-40 border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-6"><Link href="/dashboard" className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><Wrench className="h-5 w-5" /></div><div className="hidden sm:block"><p className="text-sm font-semibold text-slate-900">WorkshopPro</p><p className="text-xs text-slate-500">Service Workspace</p></div></Link><nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">{flatNav.slice(0, 10).map((item) => { const Icon = item.icon; const active = isActive(item.href); return <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium", active ? "border border-blue-200 bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}><Icon size={16} /><span>{item.name}</span></Link>; })}</nav><div className="flex items-center gap-3">{userMenu}</div></div></header><div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6"><main>{children}</main></div></div>;
    }

    return <div className="flex min-h-screen bg-slate-50/80"><aside className={cn("fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-[#0A1733] text-white transition-all duration-200", sidebarOpen ? "w-72" : "w-20")}><div className="flex h-20 items-center justify-between border-b border-white/10 px-4"><Link href="/dashboard" className="flex items-center gap-3 overflow-hidden rounded-2xl px-2 py-1 transition hover:bg-white/5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><Wrench className="h-5 w-5" /></div>{sidebarOpen && <div><p className="text-base font-semibold text-white">WorkshopPro</p><p className="text-xs text-slate-300">Service Workspace</p></div>}</Link><button type="button" onClick={() => setSidebarOpen((p) => !p)} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/5 hover:text-white">{sidebarOpen ? <X size={18} /> : <Menu size={18} />}</button></div><div className="h-[calc(100vh-80px)] overflow-y-auto"><div className="space-y-6 px-4 py-5">{sections.map((section) => <div key={section.title}>{sidebarOpen && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{section.title}</p>}<div className="space-y-1.5">{section.items.map((item) => { const Icon = item.icon; const active = isActive(item.href); return <Link key={item.href} href={item.href} className={cn("group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition", active ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-white/5 hover:text-white")}><Icon size={18} />{sidebarOpen && <><span className="font-medium">{item.name}</span>{active && <ChevronRight className="ml-auto h-4 w-4" />}</>}</Link>; })}</div></div>)}</div></div></aside><div className={cn("flex-1 transition-all duration-200", sidebarOpen ? "ml-72" : "ml-20")}><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-6 py-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-2xl font-semibold text-slate-900">{titleFromPath(router.pathname)}</h1>{companyName && <p className="text-sm text-slate-500">{companyName}</p>}</div><div className="flex items-center gap-3"><Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/reminders')} className="relative rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" /></Button>{userMenu}</div></div></header><main className="min-h-[calc(100vh-88px)] p-6">{children}</main></div></div>;
}
