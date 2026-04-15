import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, Edit, Printer, Download, DollarSign,
  Clock, User, Car, Calendar, CreditCard, FileText
} from "lucide-react";
import { invoiceService } from "@/services/invoiceService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;

export default function InvoiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
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
      const invoiceData = await invoiceService.getInvoice(id);
      setInvoice(invoiceData);
      
      const paymentData = await invoiceService.getPayments(id);
      setPayments(paymentData);
      
      setLineItems([]);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!invoice) {
    return (
      <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Accountant">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invoice not found</p>
          <Button onClick={() => router.push("/invoices")} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const gstAmount = totalAmount * 0.15;
  const grandTotal = totalAmount + gstAmount;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = grandTotal - totalPaid;

  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && balance > 0;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Accountant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/invoices")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-heading font-bold">{invoice.invoice_number}</h1>
                <StatusBadge type="invoice" status={invoice.status} />
                {isOverdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Issued {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => router.push(`/invoices/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {balance > 0 && (
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Details</CardTitle>
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
                      <p className="text-muted-foreground">Invoice Date</p>
                      <p className="font-medium">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className={cn(
                        "font-medium",
                        isOverdue && "text-destructive"
                      )}>
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {(invoice as any).notes && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{(invoice as any).notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
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

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payments recorded</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {payment.payment_method || "Payment"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.payment_date).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">${payment.amount.toFixed(2)}</p>
                          {payment.reference && (
                            <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
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
                <div className="flex justify-between text-sm text-success border-t pt-3">
                  <span>Paid</span>
                  <span className="font-medium">${totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Balance Due</span>
                  <span className={cn(
                    balance > 0 ? "text-destructive" : "text-success"
                  )}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Send to Customer
                </Button>
                <Button className="w-full" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Send Payment Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}