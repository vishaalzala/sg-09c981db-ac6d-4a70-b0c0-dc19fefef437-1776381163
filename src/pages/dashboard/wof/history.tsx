import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";

export default function WofHistoryPage() {
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [rows, setRows] = useState < any[] > ([]);
    useEffect(() => { void load(); }, []);
    const load = async () => {
        const company = await companyService.getCurrentCompany();
        if (!company?.id) return;
        setCompanyId(company.id); setCompanyName(company.name || "");
        const { data } = await (supabase as any).from("wof_inspections").select("*").eq("company_id", company.id).order("created_at", { ascending: false }).limit(50);
        setRows(data || []);
    };
    return <AppLayout companyId={companyId} companyName={companyName}><style jsx global>{`@media print{aside,nav,header,.no-print{display:none!important}@page{size:A4;margin:14mm}}`}</style><div className="p-6 space-y-6"><div className="flex justify-between"><h1 className="text-3xl font-bold">WOF History</h1><Button onClick={() => window.print()} className="no-print">Print / Save PDF</Button></div><Card><CardHeader><CardTitle>Recent WOF inspections</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <p className="text-muted-foreground">No WOF history found.</p> : <div className="space-y-2">{rows.map((r) => <div key={r.id} className="rounded border p-3 text-sm"><strong>{r.registration_number || r.rego || "Vehicle"}</strong><div>{r.status || "completed"} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</div></div>)}</div>}</CardContent></Card></div></AppLayout>;
}
