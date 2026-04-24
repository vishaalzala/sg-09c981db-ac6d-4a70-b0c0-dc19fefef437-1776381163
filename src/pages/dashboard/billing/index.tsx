import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { billingService } from "@/services/billingService";
import { useToast } from "@/hooks/use-toast";

export default function DashboardBillingPage() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [addons, setAddons] = useState<any[]>([]);
  const [enabled, setEnabled] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { void loadData(); }, []);

  const loadData = async () => {
    const company = await companyService.getCurrentCompany();
    if (!company?.id) return;
    setCompanyId(company.id);
    const [catalog, rows] = await Promise.all([
      billingService.getAddonCatalog().catch(() => []),
      companyService.getCompanyAddons(company.id).catch(() => []),
    ]);
    setAddons(catalog || []);
    setEnabled(rows || []);
  };

  const handleToggleAddon = async (addonId: string, next: boolean) => {
    setSavingId(addonId);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("You must be logged in.");
      const response = await fetch("/api/company/toggle-addon", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ addonId, enabled: next }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not update add-on");
      await loadData();
      toast({ title: next ? "Add-on enabled" : "Add-on disabled" });
    } catch (error: any) {
      toast({ title: "Add-on update failed", description: error.message, variant: "destructive" });
    } finally { setSavingId(null); }
  };

  return <AppLayout companyId={companyId}><div className="p-6 space-y-6"><div><h1 className="text-3xl font-bold">Billing & Add-ons</h1><p className="text-muted-foreground">Enable or disable optional paid modules.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{addons.map((addon) => { const active = enabled.some((row) => row.addon_id === addon.id && row.is_enabled); return <Card key={addon.id}><CardHeader><CardTitle className="flex justify-between gap-3"><span>{addon.display_name || addon.name}</span><Badge>{active ? "Enabled" : "Disabled"}</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{addon.description || "WorkshopPro add-on"}</p><div className="text-2xl font-bold">${Number(addon.price_monthly || 0).toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div><div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm font-medium">Enable</span><Switch checked={active} disabled={savingId === addon.id} onCheckedChange={(v) => handleToggleAddon(addon.id, v)} /></div></CardContent></Card>; })}</div></div></AppLayout>;
}
