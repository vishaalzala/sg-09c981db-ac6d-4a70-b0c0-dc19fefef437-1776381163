import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function JobCentre() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    
    if (company) {
      setCompanyId(company.id);

      // Load jobs based on filter
      let jobsQuery = supabase
        .from("jobs")
        .select(`
          *,
          customer:customers!jobs_customer_id_fkey(name),
          vehicle:vehicles!jobs_vehicle_id_fkey(registration_number, make, model)
        `)
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      if (activeTab === "today") {
        const today = new Date().toISOString().split("T")[0];
        jobsQuery = jobsQuery.gte("created_at", `${today}T00:00:00`);
      } else if (activeTab === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        jobsQuery = jobsQuery.gte("created_at", weekAgo.toISOString());
      }

      const { data: jobsData } = await jobsQuery;
      setJobs(jobsData || []);

      // Load unpaid invoices for right sidebar
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select(`
          *,
          customer:customers!invoices_customer_id_fkey(name)
        `)
        .eq("company_id", company.id)
        .in("status", ["unpaid", "partially_paid", "overdue"])
        .order("invoice_date", { ascending: false })
        .limit(10);
      
      setUnpaidInvoices(invoicesData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
    const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;
    
    return (
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="flex gap-6 h-full">
        {/* Main Content - Current Jobs */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-3xl font-bold">Job Centre</h1>
            <Button onClick={() => router.push("/dashboard/jobs/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">Current Jobs</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>

              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <TabsContent value={activeTab}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>JOB #</TableHead>
                        <TableHead>VEHICLE</TableHead>
                        <TableHead>CUSTOMER</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>ASSIGNED TO</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => {
                        const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
                        const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;

                        return (
                          <TableRow
                            key={job.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                          >
                            <TableCell className="font-medium">{job.job_number}</TableCell>
                            <TableCell>
                              {vehicle ? `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}` : "N/A"}
                            </TableCell>
                            <TableCell>{customer?.name || "N/A"}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                job.status === "completed" && "bg-green-100 text-green-800",
                                job.status === "in_progress" && "bg-blue-100 text-blue-800",
                                job.status === "pending" && "bg-yellow-100 text-yellow-800"
                              )}>
                                {job.status?.replace("_", " ")}
                              </span>
                            </TableCell>
                            <TableCell>{job.assigned_to || "Unassigned"}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">View</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Unpaid Invoices */}
        <div className="w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unpaid Invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unpaidInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No unpaid invoices
                </p>
              ) : (
                unpaidInvoices.map((invoice) => {
                  const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer;
                  
                  return (
                    <div
                      key={invoice.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{customer?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-primary">
                            ${(invoice.total_amount || 0).toFixed(2)}
                          </p>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            invoice.status === "overdue" && "bg-red-100 text-red-800",
                            invoice.status === "unpaid" && "bg-yellow-100 text-yellow-800",
                            invoice.status === "partially_paid" && "bg-orange-100 text-orange-800"
                          )}>
                            {invoice.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}