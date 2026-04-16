import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, Edit, Printer, FileText, CheckCircle2, XCircle,
  Clock, User, Car, Calendar, DollarSign, Copy, Wrench, ArrowRight, Send, Trash2, Check, X, Percent, TrendingUp
} from "lucide-react";
import { quoteService } from "@/services/quoteService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { invoiceService } from "@/services/invoiceService";
import { jobService } from "@/services/jobService";
import { DiscountModal } from "@/components/DiscountModal";
import { SalesOpportunityModal } from "@/components/SalesOpportunityModal";

type Quote = Tables<"quotes">;

export default function QuoteDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [converting, setConverting] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);

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
      const quoteData = await quoteService.getQuote(id);
      setQuote(quoteData);
      
      // Load line items
      setLineItems([]);
    }
    setLoading(false);
  };

  const handleConvertToInvoice = async () => {
    if (!quote) return;
    
    setConverting(true);
    try {
      // Create invoice from quote
      const invoice = await invoiceService.createInvoice({
        company_id: quote.company_id,
        customer_id: quote.customer_id,
        vehicle_id: quote.vehicle_id,
        quote_id: quote.id,
        invoice_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: quote.notes || "",
        status: "draft",
        subtotal: (quote as any).subtotal || 0,
        tax: (quote as any).tax || 0,
        total: (quote as any).total || 0,
        created_by: null
      } as any);

      // Copy line items (placeholder - would need actual line items)
      
      // Update quote status
      await quoteService.updateQuote(quote.id, { status: "converted" } as any);

      toast({ title: "Converted to Invoice", description: "Quote has been converted to invoice successfully" });
      router.push(`/invoices/${invoice.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setConverting(false);
  };

  const handleConvertToJob = async () => {
    if (!quote) return;
    
    setConverting(true);
    try {
      // Create job from quote
      const job = await jobService.createJob({
        company_id: quote.company_id,
        customer_id: quote.customer_id,
        vehicle_id: quote.vehicle_id,
        quote_id: quote.id,
        title: `Job from Quote #${quote.quote_number}`,
        description: quote.notes || "",
        status: "booked",
        priority: "normal",
        created_by: null
      } as any);

      // Update quote status
      await quoteService.updateQuote(quote.id, { status: "approved" } as any);

      toast({ title: "Converted to Job", description: "Quote has been converted to job successfully" });
      router.push(`/jobs/${job.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setConverting(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!quote) {
    return (
      <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Advisor">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Quote not found</p>
          <Button onClick={() => router.push("/quotes")} className="mt-4">
            Back to Quotes
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const gstAmount = totalAmount * 0.15;
  const grandTotal = totalAmount + gstAmount;

  const isExpired = quote.expiry_date && new Date(quote.expiry_date) < new Date();

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Advisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/quotes")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold">{quote.quote_number}</h1>
                <StatusBadge type="quote" status={quote.status} />
                {isExpired && (
                  <Badge variant="destructive">Expired</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Created {new Date(quote.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDiscountModal(true)} disabled={converting}>
              <Percent className="h-4 w-4 mr-2" />
              Discount
            </Button>
            <Button variant="outline" onClick={() => setShowOpportunityModal(true)} disabled={converting}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
            <Button variant="outline" onClick={handleConvertToJob} disabled={converting || quote.status === "converted"}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Convert to Job
            </Button>
            <Button onClick={handleConvertToInvoice} disabled={converting || quote.status === "converted"}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Convert to Invoice
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Quote Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quote Details</CardTitle>
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
                      <p className="text-muted-foreground">Quote Date</p>
                      <p className="font-medium">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Valid Until</p>
                      <p className={cn(
                        "font-medium",
                        isExpired && "text-destructive"
                      )}>
                        {quote.expiry_date ? new Date(quote.expiry_date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {(quote as any).description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{(quote as any).description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Quote Items</CardTitle>
                  <Button size="sm">Add Item</Button>
                </div>
              </CardHeader>
              <CardContent>
                {lineItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No items added</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Would map line items here */}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (15%)</span>
                  <span className="font-medium">${gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quote.status === "pending" && (
                  <>
                    <Button className="w-full">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Approved
                    </Button>
                    <Button className="w-full" variant="outline">
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Declined
                    </Button>
                  </>
                )}
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Send to Customer
                </Button>
              </CardContent>
            </Card>

            {/* Customer Approval */}
            {quote.status === "approved" && (
              <Card className="border-success bg-success/5">
                <CardHeader>
                  <CardTitle className="text-lg text-success">Customer Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Approved on {quote.updated_at ? new Date(quote.updated_at).toLocaleDateString() : "—"}
                  </p>
                </CardContent>
              </Card>
            )}

            {quote.status === "declined" && (
              <Card className="border-destructive bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Customer Declined</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Declined on {quote.updated_at ? new Date(quote.updated_at).toLocaleDateString() : "—"}
                  </p>
                  {(quote as any).decline_reason && (
                    <p className="text-sm mt-2 text-muted-foreground">
                      Reason: {(quote as any).decline_reason}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
          entityType="quote"
          entityId={quote.id}
          companyId={quote.company_id}
          subtotal={(quote as any).subtotal || 0}
          onDiscountApplied={() => {
            setShowDiscountModal(false);
            loadData();
          }}
        />
      )}

      {/* Sales Opportunity Modal */}
      {showOpportunityModal && (
        <SalesOpportunityModal
          isOpen={showOpportunityModal}
          onClose={() => setShowOpportunityModal(false)}
          companyId={quote.company_id}
          customerId={quote.customer_id}
          vehicleId={quote.vehicle_id}
          sourceType="quote"
          sourceId={quote.id}
          onSaved={() => {
            setShowOpportunityModal(false);
            toast({ title: "Opportunity Added", description: "Sales opportunity has been created" });
          }}
        />
      )}
    </AppLayout>
  );
}