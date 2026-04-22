import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/jobService";
import { Mail, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState < any > (null);
    const [lineItems, setLineItems] = useState < any[] > ([]);
    const [invoice, setInvoice] = useState < any > (null);
    const [jobTypes, setJobTypes] = useState < any[] > ([]);
    const [mechanics, setMechanics] = useState < any[] > ([]);
    const [tags, setTags] = useState < any[] > ([]);
    const [newNote, setNewNote] = useState("");
    const [activeTab, setActiveTab] = useState < "checksheet" | "invoice" > ("checksheet");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!id) return;
        void bootstrap();
    }, [id]);

    const bootstrap = async () => {
        setLoading(true);
        const company = await companyService.getCurrentCompany();
        if (!company) return;
        setCompanyId(company.id);
        await loadData(company.id, String(id));
        setLoading(false);
    };

    const loadData = async (cId: string, jobId: string) => {
        const [jobRes, itemsRes, jobTypesRes, mechanicsRes, tagsRes, invoiceRes] = await Promise.all([
            supabase
                .from("jobs")
                .select(`
          *,
          customer:customers!jobs_customer_id_fkey(*),
          vehicle:vehicles!jobs_vehicle_id_fkey(*)
        `)
                .eq("company_id", cId)
                .eq("id", jobId)
                .single(),
            supabase.from("job_line_items").select("*").eq("job_id", jobId).order("sort_order"),
            supabase.from("job_job_types").select("job_type:job_types(*)").eq("job_id", jobId),
            supabase.from("job_mechanics").select("user:users(id,full_name,email)").eq("job_id", jobId),
            supabase.from("job_tags").select("tag:tags(*)").eq("job_id", jobId),
            supabase
                .from("invoices")
                .select(`*, invoice_line_items(*)`)
                .eq("job_id", jobId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

        setJob(jobRes.data);
        setLineItems(itemsRes.data || []);
        setJobTypes((jobTypesRes.data || []).map((row: any) => row.job_type).filter(Boolean));
        setMechanics((mechanicsRes.data || []).map((row: any) => row.user).filter(Boolean));
        setTags((tagsRes.data || []).map((row: any) => row.tag).filter(Boolean));
        setInvoice(invoiceRes.data || null);
        setActiveTab(invoiceRes.data ? "invoice" : "checksheet");
    };

    const customer = useMemo(() => (Array.isArray(job?.customer) ? job.customer[0] : job?.customer), [job]);
    const vehicle = useMemo(() => (Array.isArray(job?.vehicle) ? job.vehicle[0] : job?.vehicle), [job]);

    const checksheetItems = lineItems.filter((item) => item.line_type !== "header");
    const subtotal = invoice?.subtotal ?? (invoice?.invoice_line_items || []).reduce((sum: number, item: any) => sum + Number(item.line_total || 0), 0);
    const taxAmount = invoice?.tax_amount ?? subtotal * 0.15;
    const totalAmount = invoice?.total_amount ?? subtotal + taxAmount;

    const updateStatus = async (status: string) => {
        if (!job) return;
        setBusy(true);
        const updates: any = { status };
        if (status === "finished") updates.finished_at = new Date().toISOString();
        const { error } = await supabase.from("jobs").update(updates).eq("id", job.id);
        setBusy(false);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            return;
        }
        await loadData(companyId, job.id);
    };

    const addLineItem = async (line_type: "item" | "header") => {
        if (!job) return;
        const { error } = await supabase.from("job_line_items").insert({
            job_id: job.id,
            description: line_type === "header" ? "New header" : "New work item",
            quantity: 1,
            unit_price: 0,
            line_total: 0,
            line_type,
            sort_order: lineItems.length,
        } as any);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            return;
        }
        await loadData(companyId, job.id);
    };

    const saveLineItem = async (itemId: string, updates: any) => {
        const { error } = await supabase.from("job_line_items").update(updates).eq("id", itemId);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            return;
        }
        await loadData(companyId, String(id));
    };

    const addNote = async () => {
        if (!job || !newNote.trim()) return;
        const combined = [job.internal_notes, newNote.trim()].filter(Boolean).join("\n\n");
        const { error } = await supabase.from("jobs").update({ internal_notes: combined }).eq("id", job.id);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            return;
        }
        setNewNote("");
        await loadData(companyId, job.id);
    };

    const createInvoice = async () => {
        if (!job) return;
        setBusy(true);
        try {
            const newInvoice = await jobService.createInvoiceFromJob({ companyId, job, lineItems: checksheetItems });
            setInvoice(newInvoice);
            await loadData(companyId, job.id);
            toast({ title: "Invoice created", description: `Invoice ${newInvoice.invoice_number} was created from this job.` });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to create invoice", variant: "destructive" });
        } finally {
            setBusy(false);
        }
    };

    const printJobSheet = () => {
        if (!job) return;
        const mechanicNames = mechanics.map((m) => m.full_name || m.email).join(", ") || "N/A";
        const printable = `
      <html>
        <head>
          <title>Job Sheet ${job.job_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, h2, h3 { margin: 0 0 12px; }
            .row { display:flex; justify-content:space-between; gap:24px; margin-bottom:20px; }
            .card { flex:1; border:1px solid #ddd; padding:16px; border-radius:8px; }
            table { width:100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border:1px solid #ddd; padding:10px; text-align:left; }
            th { background:#f6f6f6; }
            .muted { color:#666; }
          </style>
        </head>
        <body>
          <h1>Job Sheet ${job.job_number || ""}</h1>
          <div class="row">
            <div class="card">
              <h3>Customer</h3>
              <div>${customer?.name || ""}</div>
              <div class="muted">${customer?.mobile || customer?.phone || ""}</div>
              <div class="muted">${customer?.email || ""}</div>
            </div>
            <div class="card">
              <h3>Vehicle</h3>
              <div>${vehicle?.make || ""} ${vehicle?.model || ""} ${vehicle?.year || ""}</div>
              <div class="muted">Rego: ${vehicle?.registration_number || "N/A"}</div>
              <div class="muted">Odometer: ${job.odometer || vehicle?.odometer || "N/A"}</div>
            </div>
          </div>
          <div class="row">
            <div class="card">
              <h3>Job Details</h3>
              <div><strong>Description:</strong> ${job.description || job.job_title || ""}</div>
              <div><strong>Start:</strong> ${job.start_time ? new Date(job.start_time).toLocaleString() : "N/A"}</div>
              <div><strong>Pickup:</strong> ${job.pickup_time ? new Date(job.pickup_time).toLocaleString() : "N/A"}</div>
              <div><strong>Mechanics:</strong> ${mechanicNames}</div>
            </div>
          </div>
          <h2>Checksheet</h2>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Notes</th></tr></thead>
            <tbody>
              ${checksheetItems.map((item) => `<tr><td>${item.description || ""}</td><td>${item.quantity || 1}</td><td>${item.notes || ""}</td></tr>`).join("")}
            </tbody>
          </table>
          ${job.internal_notes ? `<h3 style="margin-top:24px;">Workshop notes</h3><div>${String(job.internal_notes).replace(/\n/g, "<br />")}</div>` : ""}
        </body>
      </html>`;
        const w = window.open("", "_blank", "width=1000,height=800");
        if (!w) return;
        w.document.write(printable);
        w.document.close();
        w.focus();
        w.print();
    };

    if (loading) return <LoadingSpinner />;
    if (!job) return <div className="p-8">Job not found</div>;

    return (
        <AppLayout companyId={companyId}>
            <div className="mx-auto w-full max-w-[1700px] space-y-4 p-6">
                <div className={cn("grid gap-4", invoice ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "grid-cols-1")}>
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold">#{job.job_number} {job.job_title}</h1>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tags.map((tag: any) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline">Sub Job</Button>
                                    <Button variant="outline">Send</Button>
                                    <Button variant="outline"><Mail className="mr-2 h-4 w-4" />Email</Button>
                                    <Button variant="outline" onClick={printJobSheet}><Printer className="mr-2 h-4 w-4" />Print</Button>
                                    <Button variant="outline" className="border-orange-300 text-orange-600" disabled={busy} onClick={() => void updateStatus("hold")}>Hold</Button>
                                    <Button disabled={busy} onClick={() => void updateStatus("finished")}>Finish</Button>
                                    {!invoice && <Button variant="destructive" disabled={busy} onClick={createInvoice}>Create Invoice</Button>}
                                </div>
                            </div>

                            <div className="mt-8 grid gap-6 md:grid-cols-2">
                                <div className="space-y-1 text-lg">
                                    <div>Created By: <span className="font-medium">{job.created_by || "Workshop"}</span> on {job.created_at ? new Date(job.created_at).toLocaleString() : "N/A"}</div>
                                    <div>Job Type: <span className="font-medium">{jobTypes.map((t: any) => t.name).join(", ") || "N/A"}</span></div>
                                    <div>Description: <span className="font-medium">{job.description || job.job_title}</span></div>
                                    <div>Job Started: <span className="font-medium">{job.start_time ? new Date(job.start_time).toLocaleString() : "N/A"}</span></div>
                                    <div>Pickup At: <span className="font-medium">{job.pickup_time ? new Date(job.pickup_time).toLocaleString() : "N/A"}</span></div>
                                    <div>Odometer: <span className="font-medium">{job.odometer || "N/A"}</span></div>
                                    <div>Mechanics: <span className="font-medium">{mechanics.map((m: any) => m.full_name || m.email).join(", ") || "N/A"}</span></div>
                                </div>
                                <div className="space-y-1 text-lg text-orange-600">
                                    <div>Customer: <span className="text-slate-900">{customer?.name || "N/A"}</span></div>
                                    <div>Email: <span className="text-slate-900">{customer?.email || "N/A"}</span></div>
                                    <div>Mobile: <span className="text-slate-900">{customer?.mobile || "N/A"}</span></div>
                                    <div>Phone: <span className="text-slate-900">{customer?.phone || "N/A"}</span></div>
                                    <div>Price Level: <span className="text-slate-900">N/A</span></div>
                                    <div>Payment Term: <span className="text-slate-900">COD</span></div>
                                    <div className="mt-6">Make: <span className="text-slate-900">{vehicle?.make || "N/A"} {vehicle?.model || ""} {vehicle?.year || ""}</span></div>
                                    <div>Reg. No.: <span className="text-slate-900">{vehicle?.registration_number || "N/A"}</span></div>
                                    <div>WOF Due Date: <span className="text-slate-900">{job.wof_due_date || vehicle?.wof_expiry || "N/A"}</span></div>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Button variant="link" className="h-auto p-0 text-primary">+ Add note</Button>
                                    <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Workshop note" rows={3} />
                                    <Button variant="outline" onClick={addNote}>Save Note</Button>
                                    <Button variant="link" className="h-auto p-0 text-primary">Upload Photos/Documents</Button>
                                </div>
                                {job.internal_notes && (
                                    <div className="rounded-lg border bg-slate-50 p-4 text-sm whitespace-pre-wrap">
                                        {job.internal_notes}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {invoice && (
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="mb-2 flex gap-6 text-sm font-semibold text-slate-700">
                                            <button className={cn(activeTab === "invoice" && "text-orange-600")} onClick={() => setActiveTab("invoice")}>INVOICES</button>
                                            <span>QUOTE</span>
                                            <span>PURCHASE ORDERS</span>
                                            <span>BILLS</span>
                                            <span>COGS</span>
                                        </div>
                                        <h2 className="text-3xl font-bold">Invoice #{invoice.invoice_number}</h2>
                                    </div>
                                    <div className="rotate-[-12deg] rounded border-4 border-red-600 px-3 py-1 text-3xl font-extrabold text-red-600">{invoice.status?.toUpperCase() || "UNPAID"}</div>
                                </div>

                                <div className="mt-6 flex flex-wrap justify-between gap-4">
                                    <div className="space-y-1 text-lg">
                                        <div>Bill To: <span className="font-medium">{customer?.name || "N/A"}</span></div>
                                        <div>Payment Term: <span className="font-medium">{invoice.payment_term || "COD"}</span></div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 self-start">
                                        <Button variant="outline"><Printer className="mr-2 h-4 w-4" />Print</Button>
                                        <Button variant="outline">Email Invoice</Button>
                                        <Button variant="outline">More Details</Button>
                                    </div>
                                    <div className="space-y-1 text-lg">
                                        <div>Invoice Number: <span className="font-medium">{invoice.invoice_number}</span></div>
                                        <div>Issue Date: <span className="font-medium">{invoice.invoice_date}</span></div>
                                        <div>Due Date: <span className="font-medium">{invoice.due_date}</span></div>
                                        <div>Order Number: <span className="font-medium">{invoice.order_number || ""}</span></div>
                                        <div>Finalized By: <span className="font-medium">Workshop</span></div>
                                    </div>
                                </div>

                                <div className="mt-6 inline-flex rounded bg-green-100 px-3 py-2 text-green-700">Finalized by Workshop at {new Date(invoice.created_at).toLocaleString()}</div>

                                <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-4 py-3 text-left">DESCRIPTION</th>
                                                <th className="px-4 py-3 text-right">QTY</th>
                                                <th className="px-4 py-3 text-right">RATE</th>
                                                <th className="px-4 py-3 text-right">TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(invoice.invoice_line_items || []).map((item: any) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="px-4 py-3">{item.description}</td>
                                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right">${Number(item.unit_price || 0).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right">${Number(item.line_total || 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <div className="w-full max-w-[320px] space-y-1 text-lg">
                                        <div className="flex justify-between"><span>Total Excl. GST:</span><strong>${Number(subtotal || 0).toFixed(2)}</strong></div>
                                        <div className="flex justify-between"><span>GST:</span><strong>${Number(taxAmount || 0).toFixed(2)}</strong></div>
                                        <div className="flex justify-between text-xl"><span>Total:</span><strong>${Number(totalAmount || 0).toFixed(2)}</strong></div>
                                        <div className="flex justify-between"><span>Paid:</span><strong>${Number(invoice.amount_paid || 0).toFixed(2)}</strong></div>
                                        <div className="flex justify-between"><span>Balance Due:</span><strong>${Number(invoice.balance ?? totalAmount).toFixed(2)}</strong></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        <div className="border-b px-6 pt-4">
                            <div className="flex gap-6 text-lg font-semibold">
                                <button className={cn("border-b-2 pb-3", activeTab === "checksheet" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-700")} onClick={() => setActiveTab("checksheet")}>CHECKSHEET</button>
                                <button className={cn("border-b-2 pb-3", activeTab === "invoice" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-700")} onClick={() => setActiveTab("invoice")} disabled={!invoice}>TIMESHEET</button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-8 px-6 py-4 text-primary">
                            <button onClick={() => addLineItem("item")}>+ Add works</button>
                            <button onClick={() => addLineItem("header")}>+ Add header</button>
                            <button onClick={createInvoice} disabled={!!invoice || busy}>Copy invoice items</button>
                            <button className="ml-auto">More Actions</button>
                        </div>

                        <div className="overflow-x-auto px-6 pb-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50">
                                        <th className="px-3 py-3 text-left">Description</th>
                                        <th className="px-3 py-3 text-left">Qty</th>
                                        <th className="px-3 py-3 text-left">Notes</th>
                                        {activeTab === "invoice" && <th className="px-3 py-3 text-left">Price</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item) => (
                                        <tr key={item.id} className="border-b last:border-b-0">
                                            <td className="px-3 py-3">
                                                <Input value={item.description || ""} onChange={(e) => setLineItems((prev) => prev.map((x) => x.id === item.id ? { ...x, description: e.target.value } : x))} onBlur={(e) => void saveLineItem(item.id, { description: e.target.value })} />
                                            </td>
                                            <td className="px-3 py-3 w-[90px]">
                                                <Input type="number" value={item.quantity || 1} onChange={(e) => setLineItems((prev) => prev.map((x) => x.id === item.id ? { ...x, quantity: Number(e.target.value || 1) } : x))} onBlur={(e) => {
                                                    const quantity = Number(e.target.value || 1);
                                                    void saveLineItem(item.id, { quantity, line_total: quantity * Number(item.unit_price || 0) });
                                                }} />
                                            </td>
                                            <td className="px-3 py-3">
                                                <Input value={item.notes || ""} onChange={(e) => setLineItems((prev) => prev.map((x) => x.id === item.id ? { ...x, notes: e.target.value } : x))} onBlur={(e) => void saveLineItem(item.id, { notes: e.target.value })} />
                                            </td>
                                            {activeTab === "invoice" && <td className="px-3 py-3">${Number(item.unit_price || 0).toFixed(2)}</td>}
                                        </tr>
                                    ))}
                                    {lineItems.length === 0 && <tr><td className="px-3 py-8 text-muted-foreground" colSpan={activeTab === "invoice" ? 4 : 3}>No checksheet items yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
