import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Receipt, User, Car, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { invoiceService } from "@/services/invoiceService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSelector } from "@/components/CustomerSelector";
import { VehicleSelector } from "@/components/VehicleSelector";
import { useToast } from "@/components/ui/use-toast";

export default function InvoicesPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer_id: "",
    vehicle_id: "",
    notes: "",
    status: "unpaid",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const status = activeTab === "all" ? undefined : activeTab;
      const data = await invoiceService.getInvoices(company.id, status);
      setInvoices(data);
    }
    setLoading(false);
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.customer_id) {
      toast({ title: "Error", description: "Customer is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await companyService.getCurrentCompany();
      if (!company) throw new Error("No company context found");

      const invoice = await invoiceService.createInvoice({
        ...newInvoice,
        company_id: company.id,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      } as any);

      toast({ title: "Success", description: "Invoice created successfully" });
      setShowAddDialog(false);
      setNewInvoice({ customer_id: "", vehicle_id: "", notes: "", status: "unpaid" });
      
      // Redirect to invoice detail page
      window.location.href = `/invoices/${invoice.id}`;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filterInvoicesByStatus = (status?: string) => {
    if (!status || status === "all") return invoices;
    return invoices.filter(i => i.status === status);
  };

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer invoices and payments
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="partially_paid">Partially Paid</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoices List</CardTitle>
                <CardDescription>
                  {activeTab === "all" ? "All invoices" : `Invoices with status: ${activeTab.replace(/_/g, " ")}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filterInvoicesByStatus(activeTab === "all" ? undefined : activeTab).length === 0 ? (
                  <EmptyState
                    icon={Receipt}
                    title="No invoices"
                    description={`No invoices found${activeTab !== "all" ? ` with status: ${activeTab.replace(/_/g, " ")}` : ""}`}
                    action={{
                      label: "Create Invoice",
                      onClick: () => window.location.href = "/invoices/new",
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    {filterInvoicesByStatus(activeTab === "all" ? undefined : activeTab).map((invoice) => {
                      const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer;
                      const vehicle = Array.isArray(invoice.vehicle) ? invoice.vehicle[0] : invoice.vehicle;
                      const isOverdue = invoice.status === "overdue";

                      return (
                        <div
                          key={invoice.id}
                          className={cn(
                            "p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                            isOverdue && "border-destructive/50 bg-destructive/5"
                          )}
                          onClick={() => window.location.href = `/invoices/${invoice.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{invoice.invoice_number}</span>
                                <StatusBadge status={invoice.status} type="invoice" />
                                {isOverdue && (
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{customer?.name}</span>
                              </div>

                              {vehicle && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Car className="h-3 w-3 text-muted-foreground" />
                                  <span>
                                    {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="text-right space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(invoice.invoice_date).toLocaleDateString()}
                                </span>
                              </div>

                              {invoice.due_date && (
                                <p className={cn(
                                  "text-xs",
                                  isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                                )}>
                                  Due: {new Date(invoice.due_date).toLocaleDateString()}
                                </p>
                              )}

                              {invoice.total_amount !== null && (
                                <div className="font-semibold text-primary flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {invoice.total_amount.toFixed(2)}
                                </div>
                              )}

                              {invoice.balance !== null && invoice.balance > 0 && (
                                <p className={cn(
                                  "text-xs font-medium",
                                  isOverdue ? "text-destructive" : "text-warning"
                                )}>
                                  Balance: ${invoice.balance.toFixed(2)}
                                </p>
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

      {/* Add Invoice Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <CustomerSelector
                companyId={companyId}
                value={newInvoice.customer_id}
                onChange={(customerId) => setNewInvoice({ ...newInvoice, customer_id: customerId })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle (Optional)</Label>
              <VehicleSelector
                companyId={companyId}
                customerId={newInvoice.customer_id}
                value={newInvoice.vehicle_id}
                onChange={(vehicleId) => setNewInvoice({ ...newInvoice, vehicle_id: vehicleId })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                placeholder="Invoice notes or payment terms..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}