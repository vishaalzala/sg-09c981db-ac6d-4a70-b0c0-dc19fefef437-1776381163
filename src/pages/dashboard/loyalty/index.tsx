import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";

export default function LoyaltyPage() {
  const [companyId, setCompanyId] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => { void load(); }, []);
  const load = async () => { const company = await companyService.getCurrentCompany(); if (!company?.id) return; setCompanyId(company.id); const { data } = await (supabase as any).from("loyalty_members").select("*, customers(name,email)").eq("company_id", company.id).order("points", { ascending: false }); setMembers(data || []); };
  return <AppLayout companyId={companyId}><div className="p-6 space-y-6"><h1 className="text-3xl font-bold">Loyalty Program</h1><Card><CardHeader><CardTitle>Loyalty Members</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Points</TableHead><TableHead>Tier</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{members.length === 0 ? <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No loyalty members yet.</TableCell></TableRow> : members.map((m) => <TableRow key={m.id}><TableCell>{m.customers?.name || "Unknown"}</TableCell><TableCell>{m.points}</TableCell><TableCell>{m.tier}</TableCell><TableCell><Badge>{m.is_active ? "Active" : "Inactive"}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div></AppLayout>;
}
