import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, FileText, Mail, Wrench, Receipt } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { documentService } from "@/services/documentService";

const currency = (v: any) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(Number(v || 0));

export default function DashboardQuoteDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [quote, setQuote] = useState < any > (null);
    const [customer, setCustomer] = useState < any > (null);
    const [vehicle, setVehicle] = useState < any > (null);
    const [items, setItems] = useState < any[] > ([]);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);

    useEffect(() => { if (typeof id === "string") void loadQuote(id); }, [id]);

    const loadQuote = async (quoteId: string) => {
        setLoading(true);
        try {
            const company = await companyService.getCurrentCompany();
            if (!company?.id) throw new Error("No company found");
            setCompanyId(company.id);
            const { data: quoteRow, error } = await (supabase as any).from("quotes").select("*").eq("id", quoteId).eq("company_id", company.id).single();
            if (error) throw error;
            setQuote(quoteRow);
            const [customerRes, vehicleRes, itemsRes] = await Promise.all([
                quoteRow.customer_id ? (supabase as any).from("customers").select("id, name, email, mobile, phone").eq("id", quoteRow.customer_id).eq("company_id", company.id).maybeSingle() : Promise.resolve({ data: null }),
                quoteRow.vehicle_id ? (supabase as any).from("vehicles").select("id, registration_number, make, model, year").eq("id", quoteRow.vehicle_id).eq("company_id", company.id).maybeSingle() : Promise.resolve({ data: null }),
                (supabase as any).from("quote_items").select("*").eq("quote_id", quoteId),
            ]);
            setCustomer(customerRes.data || null);
            setVehicle(vehicleRes.data || null);
            setItems(itemsRes.data || []);
        } catch (error: any) {
            toast({ title: "Could not load quote", description: error.message, variant: "destructive" });
        } finally { setLoading(false); }
    };

    const changeStatus = async (status: string) => {
        if (!quote?.id) return;
        setWorking(true);
        const { error } = await (supabase as any).from("quotes").update({ status, updated_at: new Date().toISOString() }).eq("id", quote.id).eq("company_id", companyId);
        setWorking(false);
        if (error) return toast({ title: "Status update failed", description: error.message, variant: "destructive" });
        setQuote((q: any) => ({ ...q, status }));
    };

    const convertToJob = async () => {
        if (!quote?.id) return;
        setWorking(true);
        try {
            const jobNumber = `JOB-${Date.now()}`;
            const { data, error } = await (supabase as any).from("jobs").insert({ company_id: companyId, customer_id: quote.customer_id, vehicle_id: quote.vehicle_id, job_number: jobNumber, job_title: quote.title || `Job from ${quote.quote_number || "quote"}`, description: quote.notes || null, status: "pending", source_quote_id: quote.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select("id").single();
            if (error) throw error;
            await changeStatus("accepted");
            router.push(`/dashboard/jobs/${data.id}`);
        } catch (error: any) { toast({ title: "Convert failed", description: error.message, variant: "destructive" }); }
        finally { setWorking(false); }
    };

    const convertToInvoice = async () => {
        if (!quote?.id) return;
        setWorking(true);
        try {
            const invoiceNumber = `INV-${Date.now()}`;
            const total = Number(quote.total_amount || quote.total || quote.amount || 0);
            const { data, error } = await (supabase as any).from("invoices").insert({ company_id: companyId, customer_id: quote.customer_id, vehicle_id: quote.vehicle_id, invoice_number: invoiceNumber, invoice_date: new Date().toISOString().slice(0, 10), status: "draft", total_amount: total, total, notes: quote.notes || null, source_quote_id: quote.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select("id").single();
            if (error) throw error;
            for (const item of items) {
                await (supabase as any).from("invoice_items").insert({ invoice_id: data.id, company_id: companyId, description: item.description, quantity: item.quantity || 1, unit_price: item.unit_price || 0, total: item.total || item.line_total || 0 });
            }
            router.push(`/dashboard/invoices/${data.id}`);
        } catch (error: any) { toast({ title: "Convert failed", description: error.message, variant: "destructive" }); }
        finally { setWorking(false); }
    };

    const sendQuote = async () => {
        if (!quote?.id || !customer?.email) return toast({ title: "No email", description: "Customer email is missing.", variant: "destructive" });
        setWorking(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            await documentService.sendDocument(companyId, "quote", quote.id, "quote", customer.email, userData.user?.id || "");
            await changeStatus("sent");
            toast({ title: "Quote queued", description: `Quote queued for ${customer.email}.` });
        } catch (error: any) { toast({ title: "Send failed", description: error.message, variant: "destructive" }); }
        finally { setWorking(false); }
    };

    if (loading) return <AppLayout><div className="p-6">Loading quote...</div></AppLayout>;
    if (!quote) return <AppLayout><div className="p-6">Quote not found.</div></AppLayout>;

    const total = Number(quote.total_amount || quote.total || quote.amount || 0);
    return <AppLayout companyId={companyId}><div className="p-6 space-y-6"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><Button variant="ghost" onClick={() => router.push("/dashboard/quotes")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><h1 className="text-3xl font-bold">Quote {quote.quote_number || quote.id}</h1><p className="text-muted-foreground">{customer?.name || "No customer"} · {vehicle?.registration_number || "No vehicle"}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => router.push(`/dashboard/quotes/${quote.id}/edit`)}><FileText className="mr-2 h-4 w-4" />Edit</Button><Button variant="outline" onClick={sendQuote} disabled={working}><Mail className="mr-2 h-4 w-4" />Send</Button><Button variant="outline" onClick={convertToJob} disabled={working}><Wrench className="mr-2 h-4 w-4" />Convert to Job</Button><Button onClick={convertToInvoice} disabled={working}><Receipt className="mr-2 h-4 w-4" />Convert to Invoice</Button></div></div><Card><CardHeader><CardTitle className="flex items-center justify-between">Details <Badge>{quote.status || "draft"}</Badge></CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-3"><div><p className="text-sm text-muted-foreground">Customer</p><p className="font-medium">{customer?.name || "-"}</p></div><div><p className="text-sm text-muted-foreground">Vehicle</p><p className="font-medium">{vehicle?.registration_number || "-"}</p></div><div><p className="text-sm text-muted-foreground">Total</p><p className="font-medium">{currency(total)}</p></div></div><div className="max-w-xs"><p className="mb-2 text-sm text-muted-foreground">Status</p><Select value={quote.status || "draft"} onValueChange={changeStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="declined">Declined</SelectItem></SelectContent></Select></div></CardContent></Card></div></AppLayout>;
}
