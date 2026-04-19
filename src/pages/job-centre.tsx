import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import Link from "next/link";

export default function JobCentrePage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentJobs, setCurrentJobs] = useState<any[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("all");

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    if (isDemoMode) {
      // Demo data for Job Centre
      setCompanyId("demo-company-id");
      setCurrentJobs([
        {
          id: "1",
          job_number: "#1917",
          vehicle: "2020 Mini Cooper KDH-K3",
          customer_name: "Tony",
          status: "in_progress",
          actions: "Actions",
        },
        {
          id: "2",
          job_number: "#1926",
          vehicle: "2019 Toyota C-HR C-JR794",
          customer_name: "Fiona Antonovich",
          status: "in_progress",
          actions: "Actions",
        },
        {
          id: "3",
          job_number: "#1924",
          vehicle: "Puncture CAR/SUV/4x4",
          customer_name: "Cash",
          status: "booked",
          actions: "Actions",
        },
      ]);

      setUnpaidInvoices([
        {
          id: "1",
          invoice_number: "INV4855",
          date: "16/04/26",
          customer: "Silvia Hodder",
          amount: 271.18,
        },
        {
          id: "2",
          invoice_number: "INV4850",
          date: "11/04/26",
          customer: "Chris Garbey",
          amount: 0,
        },
      ]);

      setLoading(false);
      return;
    }

    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);

      // Load current jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select(`
          *,
          customer:customers(name),
          vehicle:vehicles(registration_number, make, model)
        `)
        .eq("company_id", company.id)
        .in("status", ["in_progress", "booked", "waiting_approval", "waiting_parts"])
        .order("created_at", { ascending: false });

      setCurrentJobs(jobs || []);

      // Load unpaid invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select(`
          *,
          customer:customers(name)
        `)
        .eq("company_id", company.id)
        .in("status", ["sent", "partially_paid", "overdue"])
        .order("invoice_date", { ascending: false });

      setUnpaidInvoices(invoices || []);
    }

    setLoading(false);
  };

  const filteredJobs = currentJobs.filter((job) =>
    searchTerm
      ? job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <AppLayout companyId={companyId}>
        <div className="p-6">
          <div className="text-center py-12">Loading Job Centre...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Job Centre</h1>
            <p className="text-muted-foreground mt-1">
              Manage current jobs and unpaid invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/quotes">
                <span className="mr-2">📋</span>
                All Quotes
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/jobs">
                <span className="mr-2">🔧</span>
                All Jobs
              </Link>
            </Button>
            <Button asChild>
              <Link href="/jobs/new">+ New Job</Link>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Print Today Job Cards
          </Button>
        </div>

        <Tabs defaultValue="current-jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current-jobs">Current Jobs</TabsTrigger>
            <TabsTrigger value="unpaid-invoices">Unpaid Invoices</TabsTrigger>
          </TabsList>

          {/* Current Jobs Tab */}
          <TabsContent value="current-jobs">
            <Card>
              <CardHeader>
                <CardTitle>Current Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredJobs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No current jobs
                    </p>
                  ) : (
                    filteredJobs.map((job) => {
                      const customer = Array.isArray(job.customer)
                        ? job.customer[0]
                        : job.customer;
                      const vehicle = Array.isArray(job.vehicle)
                        ? job.vehicle[0]
                        : job.vehicle;

                      return (
                        <div
                          key={job.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/jobs/${job.id}`)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="font-semibold text-primary hover:underline"
                              >
                                {job.job_number}
                              </Link>
                              <div className="text-sm">
                                {vehicle
                                  ? `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}`
                                  : job.vehicle}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {customer?.name || job.customer_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  job.status === "in_progress"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {job.status?.replace(/_/g, " ")}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unpaid Invoices Tab */}
          <TabsContent value="unpaid-invoices">
            <Card>
              <CardHeader>
                <CardTitle>Unpaid Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unpaidInvoices.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No unpaid invoices
                    </p>
                  ) : (
                    unpaidInvoices.map((invoice) => {
                      const customer = Array.isArray(invoice.customer)
                        ? invoice.customer[0]
                        : invoice.customer;

                      return (
                        <div
                          key={invoice.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/invoices/${invoice.id}`)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Link
                                href={`/invoices/${invoice.id}`}
                                className="font-semibold text-primary hover:underline"
                              >
                                {invoice.invoice_number}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                Due: {invoice.invoice_date}
                              </div>
                              <div className="text-sm">
                                {customer?.name || invoice.customer_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="font-semibold">
                                $
                                {invoice.total_amount?.toFixed(2) ||
                                  invoice.amount}
                              </div>
                              <Badge variant="destructive">
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}