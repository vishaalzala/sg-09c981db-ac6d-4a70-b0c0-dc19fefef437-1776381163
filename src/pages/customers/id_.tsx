import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Merge, ArrowLeft } from "lucide-react";

const money = (n: any) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(Number(n || 0));

export default function DashboardCustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [companyId, setCompanyId] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeToId, setMergeToId] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => { if (typeof id === "string") void load(id); }, [id]);

  const load = async (customerId: string) => {
    setLoading(true);
    try {
      const { data: customerRow, error } = await (supabase as any).from("customers").select("*").eq("id", customerId).single();
      if (error) throw error;
      setCustomer(customerRow);
      setCompanyId(customerRow.company_id);
      const [vehiclesRes, invoicesRes, paymentsRes, quotesRes, jobsRes, customersRes] = await Promise.all([
        (supabase as any).from("vehicles").select("*").eq("customer_id", customerId).eq("company_id", customerRow.company_id).is("deleted_at", null),
        (supabase as any).from("invoices").select("*").eq("customer_id", customerId).eq("company_id", customerRow.company_id).order("invoice_date", { ascending: false }),
        (supabase as any).from("payments").select("*").eq("customer_id", customerId).eq("company_id", customerRow.company_id).order("payment_date", { ascending: false }),
        (supabase as any).from("quotes").select("*").eq("customer_id", customerId).eq("company_id", customerRow.company_id).order("quote_date", { ascending: false }),
        (supabase as any).from("jobs").select("*").eq("customer_id", customerId).eq("company_id", customerRow.company_id).order("created_at", { ascending: false }),
        (supabase as any).from("customers").select("id, name, email").eq("company_id", customerRow.company_id).neq("id", customerId).is("deleted_at", null).order("name"),
      ]);
      setVehicles(vehiclesRes.data || []);
      setInvoices(invoicesRes.data || []);
      setPayments(paymentsRes.data || []);
      setQuotes(quotesRes.data || []);
      setJobs(jobsRes.data || []);
      setAllCustomers(customersRes.data || []);
    } catch (error: any) {
      toast({ title: "Could not load customer", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const balance = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || inv.total || inv.amount || 0), 0);
    const paid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return total - paid;
  }, [invoices, payments]);

  const sendStatement = async () => {
    if (!customer?.id) return;
    setWorking(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("You must be logged in.");
      const response = await fetch("/api/customers/send-statement", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ customerId: customer.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not queue statement");
      toast({ title: "Statement queued", description: `Statement will be emailed to ${result.email}.` });
    } catch (error: any) { toast({ title: "Statement failed", description: error.message, variant: "destructive" }); }
    finally { setWorking(false); }
  };

  const mergeCustomer = async () => {
    if (!customer?.id || !mergeToId) return;
    setWorking(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("You must be logged in.");
      const response = await fetch("/api/customers/merge", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ mergeFromId: customer.id, mergeToId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not merge customer");
      toast({ title: "Customer merged", description: "Records moved to the surviving customer." });
      router.replace(`/dashboard/customers/${result.survivingCustomerId}`);
    } catch (error: any) { toast({ title: "Merge failed", description: error.message, variant: "destructive" }); }
    finally { setWorking(false); }
  };

  if (loading) return <AppLayout><div className="p-6">Loading customer...</div></AppLayout>;
  if (!customer) return <AppLayout><div className="p-6">Customer not found.</div></AppLayout>;

  return <AppLayout companyId={companyId}><div className="p-6 space-y-6"><div className="flex justify-between gap-3"><div><Button variant="ghost" onClick={() => router.push("/dashboard/customers")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><h1 className="text-3xl font-bold">{customer.name}</h1><p className="text-muted-foreground">{customer.email || "No email"} · {customer.mobile || customer.phone || "No phone"}</p></div><div className="flex gap-2"><Button variant="outline" onClick={sendStatement} disabled={working || !customer.email}><Mail className="mr-2 h-4 w-4" />Statement</Button><Button variant="outline" onClick={() => setShowMerge(true)} disabled={working}><Merge className="mr-2 h-4 w-4" />Merge</Button><Button onClick={() => router.push(`/dashboard/invoices/new?customerId=${customer.id}`)}>New Invoice</Button></div></div><div className="grid gap-4 md:grid-cols-4"><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Balance</p><p className="text-2xl font-bold">{money(balance)}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Vehicles</p><p className="text-2xl font-bold">{vehicles.length}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Jobs</p><p className="text-2xl font-bold">{jobs.length}</p></CardContent></Card><Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Invoices</p><p className="text-2xl font-bold">{invoices.length}</p></CardContent></Card></div><Card><CardHeader><CardTitle>Customer records</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2">{vehicles.map((v) => <Badge key={v.id}>{v.registration_number}</Badge>)}</div><div className="text-sm text-muted-foreground">Quotes: {quotes.length} · Payments: {payments.length}</div></CardContent></Card></div><Dialog open={showMerge} onOpenChange={setShowMerge}><DialogContent><DialogHeader><DialogTitle>Merge customer</DialogTitle></DialogHeader><div className="space-y-4"><p className="text-sm text-muted-foreground">Move all records from {customer.name} to another customer, then archive this customer.</p><Select value={mergeToId} onValueChange={setMergeToId}><SelectTrigger><SelectValue placeholder="Select surviving customer" /></SelectTrigger><SelectContent>{allCustomers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ""}</SelectItem>)}</SelectContent></Select><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowMerge(false)}>Cancel</Button><Button onClick={mergeCustomer} disabled={!mergeToId || working}>Merge Customer</Button></div></div></DialogContent></Dialog></AppLayout>;
}
