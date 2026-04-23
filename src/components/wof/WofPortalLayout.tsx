import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { Button } from "@/components/ui/button";

type Props = {
    children: ReactNode;
    title?: string;
    subtitle?: string;
};

export function WofPortalLayout({ children, title, subtitle }: Props) {
    const router = useRouter();
    const [companyName, setCompanyName] = useState("WorkshopPro Company");
    const [userName, setUserName] = useState("WOF Inspector");
    const [userEmail, setUserEmail] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [authorized, setAuthorized] = useState < boolean | null > (null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace("/login?message=Please sign in first");
                return;
            }

            const [{ data: profile }, company] = await Promise.all([
                supabase.from("profiles").select("role, full_name, email").eq("id", user.id).maybeSingle(),
                companyService.getCurrentCompany(),
            ]);

            const role = (profile as any)?.role;
            const fullName = (profile as any)?.full_name || user.user_metadata?.full_name || user.email || "WOF Inspector";
            const email = (profile as any)?.email || user.email || "";

            if (mounted) {
                setUserName(fullName);
                setUserEmail(email);
                setCompanyName(company?.name || "WorkshopPro Company");
            }

            const { data: addonRows } = await supabase
                .from("company_addons")
                .select("is_enabled, addon:addon_catalog(name, display_name)")
                .eq("company_id", company?.id || "") as any;

            const hasAddon = (addonRows || []).some((row: any) => {
                const label = `${row?.addon?.name || ""} ${row?.addon?.display_name || ""}`.toLowerCase();
                return row?.is_enabled && label.includes("wof");
            });

            const allowed = ["wof_inspector", "owner", "branch_manager", "service_advisor", "reception"].includes(role) && hasAddon;
            if (!allowed) {
                router.replace("/dashboard/settings?tab=addons");
                return;
            }

            if (mounted) setAuthorized(true);
        })();

        return () => {
            mounted = false;
        };
    }, [router]);

    const menu = useMemo(() => [
        { href: "/wof", label: "Inspect" },
        { href: "/wof/history", label: "History" },
        { href: "/wof/profile", label: "Profile" },
    ], []);

    const isActive = (href: string) => {
        if (href === "/wof") return router.pathname === "/wof";
        return router.pathname.startsWith(href);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (authorized === null) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading WOF portal…</div>;
    }

    return (
        <div className="min-h-screen bg-[#f4f7fb] text-slate-900 antialiased">
            <header className="sticky top-0 z-[60] border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-lg font-bold text-white">W</div>
                        <div>
                            <div className="text-[20px] font-bold leading-tight text-slate-900">WorkshopPro</div>
                            <div className="text-xs text-slate-500">Vehicle Inspection System</div>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <nav className="flex items-center gap-2">
                            {menu.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${isActive(item.href) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="hidden text-right sm:block">
                            <div className="text-[14px] font-semibold text-slate-800">{companyName}</div>
                            <div className="text-xs text-slate-500">WOF Inspector Portal</div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen((p) => !p)}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                                👤
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                    <div className="border-b border-slate-100 px-3 py-2">
                                        <div className="text-sm font-semibold text-slate-900">{userName}</div>
                                        <div className="text-xs text-slate-500">{userEmail}</div>
                                    </div>
                                    <button onClick={() => router.push("/wof/profile")} className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">My Profile</button>
                                    <button onClick={handleSignOut} className="w-full rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50">Log Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] px-6 py-8">
                {(title || subtitle) && (
                    <section className="mb-6 rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
                        {title && <h1 className="text-[32px] font-bold leading-tight">{title}</h1>}
                        {subtitle && <p className="mt-2 text-[16px] text-slate-500">{subtitle}</p>}
                    </section>
                )}
                {children}
            </main>
        </div>
    );
}
