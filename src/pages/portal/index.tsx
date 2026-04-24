import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export default function CustomerPortalPage() {
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => { void loadPortalData(); }, []);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) { setAccessError("Please log in to access your customer portal."); return; }

      const { data: portalUser, error } = await (supabase as any)
        .from("customer_portal_users")
        .select("*, customers(*)")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!portalUser) { setAccessError("Access not set up. Please contact your workshop to enable your customer portal."); return; }

      setProfile(portalUser.customers || null);
      const companyId = portalUser.company_id;
      const customerId = portalUser.customer_id;
      const [vehicleRes, jobRes, quoteRes, invoiceRes] = await Promise.all([
        (supabase as any).from("vehicles").select("*").eq("company_id", companyId).eq("customer_id", customerId).is("deleted_at", null),
        (supabase as any).from("jobs").select("*").eq("company_id", companyId).eq("customer_id", customerId).order("created_at", { ascending: false }).limit(20),
        (supabase as any).from("quotes").select("*").eq("company_id", companyId).eq("customer_id", customerId).order("quote_date", { ascending: false }).limit(20),
        (supabase as any).from("invoices").select("*").eq("company_id", companyId).eq("customer_id", customerId).order("invoice_date", { ascending: false }).limit(20),
      ]);
      setVehicles(vehicleRes.data || []); setJobs(jobRes.data || []); setQuotes(quoteRes.data || []); setInvoices(invoiceRes.data || []);
    } catch (error: any) { setAccessError(error.message || "Could not load portal."); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen grid place-items-center">Loading portal...</div>;
  if (accessError) return <div className="min-h-screen grid place-items-center p-6"><Card className="max-w-lg"><CardHeader><CardTitle>Portal Access</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{accessError}</p></CardContent></Card></div>;

  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-6xl space-y-6"><div><h1 className="text-3xl font-bold">Welcome, {profile?.name}</h1><p className="text-muted-foreground">Your vehicles, jobs, quotes and invoices.</p></div><Tabs defaultValue="vehicles"><TabsList><TabsTrigger value="vehicles">Vehicles</TabsTrigger><TabsTrigger value="jobs">Jobs</TabsTrigger><TabsTrigger value="quotes">Quotes</TabsTrigger><TabsTrigger value="invoices">Invoices</TabsTrigger></TabsList><TabsContent value="vehicles"><div className="grid gap-4 md:grid-cols-2">{vehicles.map((v) => <Card key={v.id}><CardContent className="p-5"><div className="font-semibold">{v.registration_number}</div><p className="text-sm text-muted-foreground">{[v.year, v.make, v.model].filter(Boolean).join(" ")}</p></CardContent></Card>)}</div></TabsContent><TabsContent value="jobs"><List rows={jobs} labelKey="job_number" /></TabsContent><TabsContent value="quotes"><List rows={quotes} labelKey="quote_number" /></TabsContent><TabsContent value="invoices"><List rows={invoices} labelKey="invoice_number" /></TabsContent></Tabs></div></div>;
}

function List({ rows, labelKey }: { rows: any[]; labelKey: string }) {
  return <Card><CardContent className="p-0">{rows.length === 0 ? <div className="p-8 text-center text-muted-foreground">No records found.</div> : rows.map((row) => <div key={row.id} className="flex items-center justify-between border-b p-4"><div><div className="font-medium">{row[labelKey] || row.id}</div><div className="text-sm text-muted-foreground">{row.created_at || row.invoice_date || row.quote_date}</div></div><Badge>{row.status || "open"}</Badge></div>)}</CardContent></Card>;
}
