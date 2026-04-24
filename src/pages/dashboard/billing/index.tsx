import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { billingService } from "@/services/billingService";
import { useToast } from "@/hooks/use-toast";

export default function DashboardBillingPage() {
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [addons, setAddons] = useState < any[] > ([]);
    const [companyAddons, setCompanyAddons] = useState < any[] > ([]);
    const [saving, setSaving] = useState < string | null > (null);

    useEffect(() => { void loadData(); }, []);
    const loadData = async () => {
        const company = await companyService.getCurrentCompany();
        if (!company?.id) return;
        setCompanyId(company.id); setCompanyName(company.name || "");
        const [catalog, enabled] = await Promise.all([
            billingService.getAddonCatalog().catch(() => []),
            companyService.getCompanyAddons(company.id).catch(() => []),
        ]);
        setAddons(catalog || []); setCompanyAddons(enabled || []);
    };

    const toggleAddon = async (addonId: string, enabled: boolean) => {
        setSaving(addonId);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error("You must be logged in");
            const response = await fetch("/api/company/toggle-addon", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ companyId, addonId, enabled }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result?.error || "Could not update add-on");
            await loadData();
            toast({ title: enabled ? "Add-on enabled" : "Add-on disabled" });
        } catch (error: any) {
            toast({ title: "Add-on update failed", description: error.message, variant: "destructive" });
        } finally { setSaving(null); }
    };

    return <AppLayout companyId={companyId} companyName={companyName}><div className="p-6 space-y-6"><h1 className="text-3xl font-bold">Billing & Add-ons</h1><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{addons.map((addon) => { const enabled = companyAddons.some((r) => r.addon_id === addon.id && r.is_enabled); return <Card key={addon.id}><CardHeader><CardTitle className="flex justify-between gap-3"><span>{addon.display_name || addon.name}</span><Badge>{enabled ? "Active" : "Inactive"}</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{addon.description || "WorkshopPro add-on"}</p><div className="text-2xl font-bold">${addon.price_monthly || 0}<span className="text-sm font-normal text-muted-foreground">/mo</span></div><div className="flex items-center justify-between rounded border p-3"><span>Enable add-on</span><Switch checked={enabled} disabled={saving === addon.id} onCheckedChange={(next) => toggleAddon(addon.id, next)} /></div></CardContent></Card>; })}</div>{addons.length === 0 && <Card><CardContent className="py-8 text-muted-foreground">No add-ons available.</CardContent></Card>}</div></AppLayout>;
}
