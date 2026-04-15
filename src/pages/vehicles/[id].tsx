import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Car, Calendar, FileText, DollarSign, Bell, 
  ArrowLeft, Edit, Trash2, AlertCircle, Download,
  Wrench, ClipboardList, Package, Upload, ExternalLink
} from "lucide-react";
import { vehicleService } from "@/services/vehicleService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles">;
type Job = Tables<"jobs">;
type Quote = Tables<"quotes">;
type Invoice = Tables<"invoices">;
type Reminder = Tables<"reminders">;

export default function VehicleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [wofHistory, setWofHistory] = useState<any[]>([]);
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
      const vehicleData = await vehicleService.getVehicle(id);
      setVehicle(vehicleData);
      
      // Load related data (simplified - would use actual service calls)
      setJobs([]);
      setQuotes([]);
      setInvoices([]);
      setReminders([]);
      setFiles([]);
      setWofHistory([]);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return (
      <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Advisor">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vehicle not found</p>
          <Button onClick={() => router.push("/vehicles")} className="mt-4">
            Back to Vehicles
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isWofDueSoon = vehicle.wof_expiry 
    ? new Date(vehicle.wof_expiry).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  const isRegoDueSoon = vehicle.rego_expiry
    ? new Date(vehicle.rego_expiry).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Advisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/vehicles")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold">{vehicle.registration_number}</h1>
              <p className="text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/vehicles/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {(isWofDueSoon || isRegoDueSoon) && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                <div>
                  {isWofDueSoon && <p className="font-medium">WOF expires soon: {new Date(vehicle.wof_expiry!).toLocaleDateString()}</p>}
                  {isRegoDueSoon && <p className="font-medium">Rego expires soon: {new Date(vehicle.rego_expiry!).toLocaleDateString()}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="wof">WOF History</TabsTrigger>
            <TabsTrigger value="reminders">Reminders ({reminders.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Registration</p>
                      <p className="font-medium">{vehicle.registration_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">VIN</p>
                      <p className="font-medium">{vehicle.vin || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Make</p>
                      <p className="font-medium">{vehicle.make || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model</p>
                      <p className="font-medium">{vehicle.model || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Year</p>
                      <p className="font-medium">{vehicle.year || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Body Type</p>
                      <p className="font-medium">{vehicle.body_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Colour</p>
                      <p className="font-medium">{vehicle.colour || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fuel Type</p>
                      <p className="font-medium">{vehicle.fuel_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Transmission</p>
                      <p className="font-medium">{vehicle.transmission || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engine Size</p>
                      <p className="font-medium">{vehicle.engine_size || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Odometer</p>
                      <p className="font-medium">{vehicle.odometer ? `${vehicle.odometer.toLocaleString()} ${vehicle.odometer_unit}` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Courtesy Vehicle</p>
                      <p className="font-medium">{vehicle.is_courtesy_vehicle ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance & Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">WOF Expiry</p>
                      <p className={cn("font-medium", isWofDueSoon && "text-warning")}>
                        {vehicle.wof_expiry ? new Date(vehicle.wof_expiry).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rego Expiry</p>
                      <p className={cn("font-medium", isRegoDueSoon && "text-warning")}>
                        {vehicle.rego_expiry ? new Date(vehicle.rego_expiry).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Service</p>
                      <p className="font-medium">
                        {vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Due</p>
                      <p className="font-medium">
                        {vehicle.service_due_date ? new Date(vehicle.service_due_date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Service ODO</p>
                      <p className="font-medium">
                        {vehicle.last_service_odometer ? `${vehicle.last_service_odometer.toLocaleString()} ${vehicle.odometer_unit}` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Due ODO</p>
                      <p className="font-medium">
                        {vehicle.service_due_odometer ? `${vehicle.service_due_odometer.toLocaleString()} ${vehicle.odometer_unit}` : "—"}
                      </p>
                    </div>
                  </div>
                  
                  {vehicle.carjam_last_fetched && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        CARJAM data last fetched: {new Date(vehicle.carjam_last_fetched).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {vehicle.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{vehicle.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service History</CardTitle>
                  <Button onClick={() => router.push(`/jobs/new?vehicle=${id}`)}>
                    <Wrench className="h-4 w-4 mr-2" />
                    New Job
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No jobs yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Job</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id} className="cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                          <TableCell className="font-medium">{job.order_number}</TableCell>
                          <TableCell>{job.job_title}</TableCell>
                          <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                          <TableCell><StatusBadge type="job" status={job.status} /></TableCell>
                          <TableCell className="text-right">—</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs similar structure... */}
          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No quotes yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No invoices yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wof">
            <Card>
              <CardHeader>
                <CardTitle>WOF Inspection History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No WOF inspections yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle>Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No reminders set</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Files & Photos</CardTitle>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No files uploaded yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}