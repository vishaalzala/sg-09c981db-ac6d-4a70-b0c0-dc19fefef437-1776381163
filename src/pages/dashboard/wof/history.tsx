import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";

export default function WofHistoryPage() {
  const [companyId, setCompanyId] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void load(); }, []);
  const load = async () => { const company = await companyService.getCurrentCompany(); if (!company?.id) return; setCompanyId(company.id); const { data } = await (supabase as any).from("wof_inspections").select("*").eq("company_id", company.id).order("created_at", { ascending: false }).limit(100); setRows(data || []); };
  return <AppLayout companyId={companyId}><style jsx global>{`@media print { aside, nav, header, .no-print { display:none!important; } @page { size:A4; margin:14mm; } }`}</style><div className="p-6 space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">WOF History</h1><p className="text-muted-foreground">Print or save WOF inspection history.</p></div><Button className="no-print" variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />PDF / Print</Button></div><Card><CardHeader><CardTitle>Inspections</CardTitle></CardHeader><CardContent>{rows.length === 0 ? <p className="text-muted-foreground">No WOF inspections found.</p> : <div className="space-y-3">{rows.map((row) => <div key={row.id} className="flex items-center justify-between border-b py-3"><div><div className="font-medium">{row.registration_number || row.rego || row.vehicle_registration || row.id}</div><div className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()}</div></div><Badge>{row.status || row.result || "recorded"}</Badge></div>)}</div>}</CardContent></Card></div></AppLayout>;
}
