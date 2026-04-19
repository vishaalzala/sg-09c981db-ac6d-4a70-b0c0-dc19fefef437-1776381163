import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Wrench, User, Car, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { jobService } from "@/services/jobService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSelector } from "@/components/CustomerSelector";
import { VehicleSelector } from "@/components/VehicleSelector";
import { useToast } from "@/hooks/use-toast";
import { demoJobs } from "@/lib/demoData";

export default function JobsPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJob, setNewJob] = useState({
    customer_id: "",
    vehicle_id: "",
    job_title: "",
    short_description: "",
    status: "booked",
  });
  const { toast } = useToast();

  // DEMO MODE: Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    
    // DEMO MODE: Use mock data
    if (isDemoMode) {
      console.log("🎭 DEMO MODE - Using mock job data");
      setJobs(demoJobs);
      setCompanyId("demo-company-id");
      setLoading(false);
      return;
    }

    // PRODUCTION MODE: Load real data
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const status = activeTab === "all" ? undefined : activeTab;
      const data = await jobService.getJobs(company.id, undefined, status);
      setJobs(data);
    }
    setLoading(false);
  };

  const handleCreateJob = async () => {
    if (!newJob.customer_id || !newJob.vehicle_id || !newJob.job_title) {
      toast({ title: "Error", description: "Customer, Vehicle, and Job Title are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await companyService.getCurrentCompany();
      if (!company) throw new Error("No company context found");

      await jobService.createJob({
        ...newJob,
        company_id: company.id,
      } as any);

      toast({ title: "Success", description: "Job created successfully" });
      setShowAddDialog(false);
      setNewJob({ customer_id: "", vehicle_id: "", job_title: "", short_description: "", status: "booked" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filterJobsByStatus = (status?: string) => {
    if (!status || status === "all") return jobs;
    return jobs.filter(j => j.status === status);
  };

  return (
    <ProtectedRoute>
      <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">Jobs</h1>
              <p className="text-muted-foreground mt-1">
                Manage workshop jobs and repairs
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="waiting_approval">Waiting Approval</TabsTrigger>
              <TabsTrigger value="waiting_parts">Waiting Parts</TabsTrigger>
              <TabsTrigger value="ready_for_pickup">Ready for Pickup</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs List</CardTitle>
                  <CardDescription>
                    {activeTab === "all" ? "All jobs" : `Jobs with status: ${activeTab.replace(/_/g, " ")}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filterJobsByStatus(activeTab === "all" ? undefined : activeTab).length === 0 ? (
                    <EmptyState
                      icon={Wrench}
                      title="No jobs"
                      description={`No jobs found${activeTab !== "all" ? ` with status: ${activeTab.replace(/_/g, " ")}` : ""}`}
                      action={{
                        label: "Create Job",
                        onClick: () => window.location.href = "/jobs/new",
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {filterJobsByStatus(activeTab === "all" ? undefined : activeTab).map((job) => {
                        const customer = Array.isArray(job.customer) ? job.customer[0] : job.customer;
                        const vehicle = Array.isArray(job.vehicle) ? job.vehicle[0] : job.vehicle;

                        return (
                          <div
                            key={job.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/jobs/${job.id}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{job.job_number || `JOB-${job.id}`}</span>
                                  <StatusBadge status={job.status} type="job" />
                                </div>

                                <div className="font-medium">{job.description || job.job_title}</div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>{job.customer_name || customer?.name}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <Car className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {job.vehicle_rego || job.vehicle_description || (vehicle && `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}`)}
                                  </span>
                                </div>

                                {job.technician_notes && (
                                  <p className="text-sm text-muted-foreground">
                                    {job.technician_notes}
                                  </p>
                                )}
                              </div>

                              <div className="text-right space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(job.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                {job.total_cost && (
                                  <div className="font-semibold text-primary">
                                    ${job.total_cost.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Job Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <CustomerSelector
                  companyId={companyId}
                  value={newJob.customer_id}
                  onChange={(customerId) => setNewJob({ ...newJob, customer_id: customerId })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle *</Label>
                <VehicleSelector
                  companyId={companyId}
                  customerId={newJob.customer_id}
                  value={newJob.vehicle_id}
                  onChange={(vehicleId) => setNewJob({ ...newJob, vehicle_id: vehicleId })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={newJob.job_title}
                  onChange={(e) => setNewJob({ ...newJob, job_title: e.target.value })}
                  placeholder="General Service / Brake Repair / WOF Inspection"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Description</Label>
                <Textarea
                  id="short_description"
                  value={newJob.short_description}
                  onChange={(e) => setNewJob({ ...newJob, short_description: e.target.value })}
                  placeholder="Customer reported brake noise when stopping..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </ProtectedRoute>
  );
}