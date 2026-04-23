import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

export default function AdminLeadsRoute() {
  const [leads, setLeads] = useState<any[]>([]);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = async () => {
    setLoading(true);
    setError("");
    try {
      let req = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
      if (status !== "all") req = req.eq("status", status);
      if (query.trim()) req = req.or(`name.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%,company_name.ilike.%${query.trim()}%`);
      const { data, error } = await req;
      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load leads. Check that the leads table exists and RLS allows super admin access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadLeads(); }, [status]);

  const updateStatus = async (id: string, nextStatus: string) => {
    const { error } = await supabase.from("leads").update({ status: nextStatus, updated_at: new Date().toISOString() } as any).eq("id", id);
    if (error) { setError(error.message); return; }
    await loadLeads();
  };

  return <AdminPageShell title="Leads" description="Contact form and public website enquiries. This is where website leads should land before conversion to trial/company.">
    <div className="space-y-6">
      <Card><CardHeader><CardTitle>Lead filters</CardTitle><CardDescription>Leads come from /contact via the public submit-lead API.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3 md:flex-row">
        <Input placeholder="Search name, email, company" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void loadLeads(); }} />
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="md:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
        <Button onClick={() => void loadLeads()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Website leads</CardTitle><CardDescription>{loading ? "Loading..." : `${leads.length} lead(s)`}</CardDescription></CardHeader><CardContent className="space-y-3">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        {!loading && !leads.length ? <div className="text-sm text-muted-foreground">No leads found.</div> : null}
        {leads.map((lead) => <div key={lead.id} className="rounded-lg border p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><div className="font-semibold">{lead.name || "Unknown"}</div><Badge variant="outline">{lead.status || "new"}</Badge><Badge variant="secondary">{lead.source || "contact_form"}</Badge></div><div className="mt-1 text-sm text-muted-foreground">{lead.company_name || "No company"} · {lead.email || "No email"} · {lead.phone || "No phone"}</div>{lead.message ? <p className="mt-3 whitespace-pre-wrap text-sm">{lead.message}</p> : null}<div className="mt-2 text-xs text-muted-foreground">Created: {lead.created_at ? new Date(lead.created_at).toLocaleString() : "—"}</div></div><Select value={lead.status || "new"} onValueChange={(v) => updateStatus(lead.id, v)}><SelectTrigger className="md:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div></div>)}
      </CardContent></Card>
    </div>
  </AdminPageShell>;
}
