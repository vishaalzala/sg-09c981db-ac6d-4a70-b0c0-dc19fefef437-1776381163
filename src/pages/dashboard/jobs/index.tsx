import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { companyService } from "@/services/companyService";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JobsPage() {
    const router = useRouter();
    const [companyId, setCompanyId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showHoldOnly, setShowHoldOnly] = useState(false);
    const [jobs, setJobs] = useState < any[] > ([]);
    const [unpaidInvoices, setUnpaidInvoices] = useState < any[] > ([]);

    useEffect(() => {
        void init();
    }, []);

    const init = async () => {
        const company = await companyService.getCurrentCompany();
        if (!company) return;
        setCompanyId(company.id);

        const [jobsRes, invoicesRes] = await Promise.all([
            supabase
                .from("jobs")
                .select(`
          *,
          customer:customers!jobs_customer_id_fkey(name,mobile,phone),
          vehicle:vehicles!jobs_vehicle_id_fkey(registration_number,make,model,year)
        `)
                .eq("company_id", company.id)
                .is("deleted_at", null)
                .order("created_at", { ascending: false }),
            supabase
                .from("invoices")
                .select(`
          *,
          customer:customers!invoices_customer_id_fkey(name,mobile,phone),
          vehicle:vehicles!invoices_vehicle_id_fkey(registration_number,make,model,year)
        `)
                .eq("company_id", company.id)
                .in("status", ["unpaid", "overdue", "partially_paid"])
                .order("due_date", { ascending: true })
                .limit(10),
        ]);

        setJobs(jobsRes.data || []);
        setUnpaidInvoices(invoicesRes.data || []);
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            if (showHoldOnly && job.status !== "hold") return false;
            if (!searchTerm) return true;
            const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
            const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;
            const q = searchTerm.toLowerCase();
            return [
                job.job_number,
                job.job_title,
                job.description,
                customer?.name,
                customer?.mobile,
                vehicle?.registration_number,
                vehicle?.make,
                vehicle?.model,
            ].some((value) => String(value || "").toLowerCase().includes(q));
        });
    }, [jobs, searchTerm, showHoldOnly]);

    return (
        <AppLayout companyId={companyId}>
            <div className="p-6">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_620px]">
                    <Card>
                        <CardHeader className="border-b pb-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <CardTitle className="text-3xl">Current Jobs</CardTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative w-[250px]">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" className="pl-9" />
                                    </div>
                                    <Button variant="outline">Print Job Cards</Button>
                                    <Button variant="outline">Print Run Sheet</Button>
                                    <Button onClick={() => router.push("/dashboard/jobs/new")}>
                                        <Plus className="mr-2 h-4 w-4" /> New
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Checkbox checked={showHoldOnly} onCheckedChange={(checked) => setShowHoldOnly(!!checked)} />
                                    Job status <span className="text-orange-600">Hold</span>
                                </label>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {filteredJobs.map((job) => {
                                    const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
                                    const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;
                                    return (
                                        <button
                                            key={job.id}
                                            className="grid w-full grid-cols-[150px_minmax(280px,1.2fr)_minmax(220px,0.7fr)_130px] items-start gap-4 px-6 py-4 text-left hover:bg-muted/40"
                                            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                                        >
                                            <div>
                                                <span className="inline-flex rounded border border-primary/30 px-3 py-1 font-medium text-primary">
                                                    #{job.job_number || job.id.slice(0, 4)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-lg">{vehicle ? `${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.registration_number || ""}`.trim() : job.job_title}</div>
                                                <div className="mt-1 text-sm italic text-muted-foreground">{job.description || job.job_title}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">{customer?.name || "Walk-in customer"}</div>
                                                <div className="text-sm text-muted-foreground">{customer?.mobile || customer?.phone || "No phone"}</div>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-sm">
                                                <span className={cn(
                                                    "rounded px-2 py-1 font-medium capitalize",
                                                    job.status === "hold" && "bg-orange-100 text-orange-700",
                                                    job.status === "finished" && "bg-blue-100 text-blue-700",
                                                    job.status === "booked" && "bg-slate-100 text-slate-700"
                                                )}>{job.status || "booked"}</span>
                                                <span className="text-primary">Actions</span>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredJobs.length === 0 && (
                                    <div className="px-6 py-10 text-sm text-muted-foreground">No jobs found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b pb-5">
                            <div className="flex items-center justify-between gap-4">
                                <CardTitle className="text-3xl">Unpaid invoices</CardTitle>
                                <div className="relative w-[250px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input placeholder="Search" className="pl-9" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {unpaidInvoices.map((invoice) => {
                                    const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer;
                                    const vehicle = Array.isArray(invoice.vehicle) ? invoice.vehicle[0] : invoice.vehicle;
                                    return (
                                        <button
                                            key={invoice.id}
                                            className="grid w-full grid-cols-[120px_minmax(240px,1fr)_160px] gap-4 px-6 py-4 text-left hover:bg-muted/40"
                                            onClick={() => router.push(`/dashboard/jobs/${invoice.job_id || ""}`)}
                                        >
                                            <div>
                                                <span className="inline-flex rounded border border-primary/30 px-3 py-1 font-medium text-primary">#{invoice.invoice_number}</span>
                                                <div className="mt-2 text-sm text-muted-foreground">Due:{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">{vehicle ? `${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""} ${vehicle.registration_number || ""}`.trim() : "Vehicle"}</div>
                                                <div className="mt-1 text-sm italic text-muted-foreground">{invoice.notes || ""}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">{customer?.name || "Customer"}</div>
                                                <div className="text-sm text-muted-foreground">{customer?.mobile || customer?.phone || ""}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                                {unpaidInvoices.length === 0 && <div className="px-6 py-10 text-sm text-muted-foreground">No unpaid invoices.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
