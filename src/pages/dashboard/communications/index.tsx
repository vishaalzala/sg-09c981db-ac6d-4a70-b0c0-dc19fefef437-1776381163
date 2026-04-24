import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";

export default function CommunicationsPage() {
  const [companyId, setCompanyId] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { void load(); }, []);
  const load = async () => { const company = await companyService.getCurrentCompany(); if (!company?.id) return; setCompanyId(company.id); const { data } = await (supabase as any).from("communications").select("*").eq("company_id", company.id).order("created_at", { ascending: false }).limit(100); setRows(data || []); };
  const table = (channel: string) => { const filtered = rows.filter((r) => r.channel === channel); return <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Recipient</TableHead><TableHead>Subject/Event</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No {channel} records yet.</TableCell></TableRow> : filtered.map((row) => <TableRow key={row.id}><TableCell>{new Date(row.created_at).toLocaleString()}</TableCell><TableCell>{row.recipient}</TableCell><TableCell>{row.subject || row.event_type}</TableCell><TableCell><Badge>{row.status}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>; };
  return <AppLayout companyId={companyId}><div className="p-6 space-y-6"><div><h1 className="text-3xl font-bold">Communications</h1><p className="text-muted-foreground">Real email/SMS log from the communications table.</p></div><Tabs defaultValue="email"><TabsList><TabsTrigger value="email">Emails</TabsTrigger><TabsTrigger value="sms">SMS</TabsTrigger></TabsList><TabsContent value="email">{table("email")}</TabsContent><TabsContent value="sms">{table("sms")}</TabsContent></Tabs></div></AppLayout>;
}
