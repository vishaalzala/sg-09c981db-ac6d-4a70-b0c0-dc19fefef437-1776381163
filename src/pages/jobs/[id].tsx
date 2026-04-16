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
import { invoiceService } from "@/services/invoiceService";
import { useToast } from "@/hooks/use-toast";
import { JobFinishModal } from "@/components/JobFinishModal";
import { CheckCircle } from "lucide-react";

type Job = Tables<"jobs">;

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (typeof id === "string") {
      const jobData = await jobService.getJob(id);
      setJob(jobData);
    }
    setLoading(false);
  };

  const handleGenerateInvoice = async () => {
    if (!job) return;
    
    setGenerating(true);
    try {
      // Create invoice from job
      const invoice = await invoiceService.createInvoice({
        company_id: job.company_id,
        customer_id: job.customer_id,
        vehicle_id: job.vehicle_id,
        job_id: job.id,
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: job.description || "",
        status: "draft",
        subtotal: 0,
        tax: 0,
        total: 0,
        created_by: null
      } as any);

      // Update job status
      await jobService.updateJob(job.id, { status: "invoiced" } as any);

      toast({ title: "Invoice Generated", description: "Invoice has been created from this job" });
      router.push(`/invoices/${invoice.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div>Job not found</div>;

  const totalLabour = lineItems.filter(i => i.type === "labour").reduce((sum, i) => sum + (i.total || 0), 0);
  const totalParts = lineItems.filter(i => i.type === "parts").reduce((sum, i) => sum + (i.total || 0), 0);
  const totalAmount = totalLabour + totalParts;

  return (
    <AppLayout companyId={job.company_id} companyName="AutoTech Workshop" userName="Manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Job #{(job as any).job_number || job.id}</h1>
            <p className="text-muted-foreground">Customer: {(job as any).customer_name || "N/A"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFinishModal(true)} disabled={job.status === "completed" || job.status === "invoiced"}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finish Job
            </Button>
            <Button onClick={handleGenerateInvoice} disabled={generating || job.status === "invoiced"}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={job.status} type="job" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{(job as any).description || "No description"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showFinishModal && (
        <JobFinishModal
          isOpen={showFinishModal}
          onClose={() => setShowFinishModal(false)}
          jobId={job.id}
          customerId={job.customer_id}
          vehicleId={job.vehicle_id}
          companyId={job.company_id}
          currentOdometer={job.odometer || 0}
          onFinishComplete={() => {
            setShowFinishModal(false);
            loadData();
          }}
          onFinishAndPay={() => {
            setShowFinishModal(false);
            handleGenerateInvoice(); // Auto-generates invoice and routes to it for payment
          }}
        />
      )}
    </AppLayout>
  );
}