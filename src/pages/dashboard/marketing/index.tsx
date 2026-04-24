import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";

export default function MarketingPage() {
    const [companyId, setCompanyId] = useState("");
    const [campaigns, setCampaigns] = useState < any[] > ([]);
    useEffect(() => { void load(); }, []);
    const load = async () => { const company = await companyService.getCurrentCompany(); if (!company?.id) return; setCompanyId(company.id); const { data } = await (supabase as any).from("marketing_campaigns").select("*").eq("company_id", company.id).order("created_at", { ascending: false }); setCampaigns(data || []); };
    return <AppLayout companyId={companyId}><div className="p-6 space-y-6"><h1 className="text-3xl font-bold">Marketing Campaigns</h1>{campaigns.length === 0 ? <Card><CardHeader><CardTitle>No campaigns yet</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Marketing automation is ready for real data. Create campaigns once the campaign builder is enabled for this company.</p></CardContent></Card> : <div className="grid gap-4">{campaigns.map((c) => <Card key={c.id}><CardContent className="flex items-center justify-between p-5"><div><div className="font-semibold">{c.name}</div><div className="text-sm text-muted-foreground">{c.channel} · audience {c.audience_count}</div></div><Badge>{c.status}</Badge></CardContent></Card>)}</div>}</div></AppLayout>;
}
