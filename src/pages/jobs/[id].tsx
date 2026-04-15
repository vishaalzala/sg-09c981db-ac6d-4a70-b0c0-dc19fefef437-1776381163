import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, Edit, Printer, FileText, DollarSign,
  Clock, User, Car, Calendar, Package, Image as ImageIcon,
  CheckCircle2, AlertCircle, Wrench, MessageSquare
} from "lucide-react";
import { jobService } from "@/services/jobService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Job = Tables<"jobs">;

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
    }

    if (typeof id === "string") {
      const jobData = await jobService.getJob(id);
      setJob(jobData);
      
      // Load related data
      setLineItems([]);
      setAttachments([]);
      setStatusHistory([]);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!job) {
    return (
      <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Technician">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => router.push("/jobs")} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalLabour = lineItems.filter(i => i.type === "labour").reduce((sum, i) => sum + (i.total || 0), 0);
  const totalParts = lineItems.filter(i => i.type === "parts").reduce((sum, i) => sum + (i.total || 0), 0);
  const totalAmount = totalLabour + totalParts;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Technician">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold">{job.order_number}</h1>
                <StatusBadge type="job" status={job.status} />
              </div>
              <p className="text-muted-foreground mt-1">{job.job_title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={() => router.push(`/jobs/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Job Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{customer?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{vehicle?.registration_number || "—"}</p>
                      <p className="text-xs text-muted-foreground">{vehicle?.make} {vehicle?.model}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Start Time</p>
                      <p className="font-medium">
                        {job.start_time ? new Date(job.start_time).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Est. Finish</p>
                      <p className="font-medium">
                        {job.estimated_finish_time ? new Date(job.estimated_finish_time).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wrench className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Technician</p>
                      <p className="font-medium">{(job as any).assigned_technician_id || "Unassigned"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Odometer</p>
                      <p className="font-medium">{(job as any).odometer ? `${(job as any).odometer.toLocaleString()} km` : "—"}</p>
                    </div>
                  </div>
                </div>

                {(job as any).description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{(job as any).description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Tabs defaultValue="labour" className="space-y-4">
              <TabsList>
                <TabsTrigger value="labour">Labour</TabsTrigger>
                <TabsTrigger value="parts">Parts</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="labour">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Labour Items</CardTitle>
                      <Button size="sm">Add Labour</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {lineItems.filter(i => i.type === "labour").length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No labour items added</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Would map labour items here */}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parts">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Parts</CardTitle>
                      <Button size="sm">Add Part</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">No parts added</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Internal Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">No notes added</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Photos & Files</CardTitle>
                  <Button size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No files uploaded</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                {statusHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status changes yet</p>
                ) : (
                  <div className="space-y-4">
                    {statusHistory.map((history, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {idx < statusHistory.length - 1 && (
                            <div className="w-0.5 h-8 bg-border mx-auto mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-sm">{history.to_status}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(history.created_at).toLocaleString()}
                          </p>
                          {history.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labour</span>
                  <span className="font-medium">${totalLabour.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parts</span>
                  <span className="font-medium">${totalParts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (15%)</span>
                  <span className="font-medium">${(totalAmount * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>${(totalAmount * 1.15).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Customer
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Quote
                </Button>
                <Button className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}