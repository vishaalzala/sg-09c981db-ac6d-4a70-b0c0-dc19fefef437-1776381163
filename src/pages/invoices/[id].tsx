import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, Edit, Printer, Download, DollarSign,
  Clock, User, Car, Calendar, CreditCard, FileText, Copy, Plus
} from "lucide-react";
import { invoiceService } from "@/services/invoiceService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { PaymentModal } from "@/components/PaymentModal";
import { jobService } from "@/services/jobService";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Copy, CreditCard, FileText, Printer, Send, Plus, Percent } from "lucide-react";
import { DiscountModal } from "@/components/DiscountModal";

type Invoice = Tables<"invoices">;

export default function InvoiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (typeof id === "string") {
      const invoiceData = await invoiceService.getInvoice(id);
      setInvoice(invoiceData);
      
      // Load payments and line items
      setPayments([]);
      setLineItems([]);
    }
    setLoading(false);
  };

  const handleCopyInvoice = async () => {
    if (!invoice) return;
    
    setProcessing(true);
    try {
      // Create duplicate invoice without payments
      const copy = await invoiceService.createInvoice({
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        vehicle_id: invoice.vehicle_id,
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: `Copy of Invoice #${invoice.invoice_number}`,
        status: "draft",
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        created_by: null
      } as any);

      toast({ title: "Invoice Copied", description: "A copy of this invoice has been created" });
      router.push(`/invoices/${copy.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const handleCreateCreditNote = async () => {
    if (!invoice) return;
    
    setProcessing(true);
    try {
      // Create credit note (negative invoice)
      const credit = await invoiceService.createInvoice({
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        vehicle_id: invoice.vehicle_id,
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: new Date().toISOString().split("T")[0],
        notes: `Credit Note for Invoice #${invoice.invoice_number}`,
        status: "draft",
        subtotal: -invoice.subtotal,
        tax: -invoice.tax,
        total: -invoice.total,
        created_by: null
      } as any);

      toast({ title: "Credit Note Created", description: "Credit note has been created for this invoice" });
      router.push(`/invoices/${credit.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const handleCreateJob = async () => {
    if (!invoice) return;
    
    setProcessing(true);
    try {
      // Create job from invoice
      const job = await jobService.createJob({
        company_id: invoice.company_id,
        customer_id: invoice.customer_id,
        vehicle_id: invoice.vehicle_id,
        title: `Job from Invoice #${invoice.invoice_number}`,
        description: invoice.notes || "Additional work required",
        status: "booked",
        priority: "normal",
        created_by: null
      } as any);

      toast({ title: "Job Created", description: "A new job has been created from this invoice" });
      router.push(`/jobs/${job.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balanceDue = (invoice?.total || 0) - totalPaid;

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <AppLayout companyId={invoice.company_id} companyName="AutoTech Workshop" userName="Manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Invoice #{invoice.invoice_number}</h1>
            <p className="text-muted-foreground">Customer: {(invoice as any).customer_name || "N/A"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDiscountModal(true)} disabled={processing}>
              <Percent className="h-4 w-4 mr-2" />
              Discount
            </Button>
            <Button variant="outline" onClick={handleCopyInvoice} disabled={processing}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleCreateCreditNote} disabled={processing}>
              <CreditCard className="h-4 w-4 mr-2" />
              Credit Note
            </Button>
            <Button variant="outline" onClick={handleCreateJob} disabled={processing}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
            <Button onClick={() => setShowPaymentModal(true)} disabled={balanceDue <= 0}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={invoice.status} type="invoice" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">${invoice.total?.toFixed(2) || "0.00"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">${invoice.total?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-semibold text-success">${totalPaid.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Balance Due</span>
                  <span className="text-lg font-bold text-primary">${balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoiceId={invoice.id}
          companyId={invoice.company_id}
          totalAmount={invoice.total || 0}
          totalPaid={totalPaid}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            loadData();
          }}
        />
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          entityType="invoice"
          entityId={invoice.id}
          companyId={invoice.company_id}
          subtotal={invoice.subtotal || 0}
          onDiscountApplied={() => {
            setShowDiscountModal(false);
            loadData();
          }}
        />
      )}
    </AppLayout>
  );
}