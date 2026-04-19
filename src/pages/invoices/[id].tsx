import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Car, Calendar, DollarSign, Plus, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { invoiceService } from "@/services/invoiceService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentModal } from "@/components/PaymentModal";
import { JobFinishModal } from "@/components/JobFinishModal";
import { cn } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showChangeVehicleDialog, setShowChangeVehicleDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showJobTypeDialog, setShowJobTypeDialog] = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    setLoading(true);

    if (isDemoMode) {
      setCompanyId("demo-company-id");
      setInvoice({
        id: id,
        invoice_number: "INV4850",
        invoice_date: "2026-04-16",
        due_date: "2026-04-16",
        status: "sent",
        total_amount: 290.00,
        customer: {
          id: "1",
          name: "Cash",
          email: "cash@example.com",
          mobile: "0274881739",
          payment_term: "COD"
        },
        vehicle: {
          id: "1",
          registration_number: "CAR/SU/4x4",
          make: "Puncture",
          model: "CAR/SU/4x4",
          year: "2020"
        },
        items: [
          {
            id: "1",
            description: "Puncture CAR/SU/4x4",
            qty: 1,
            rate: 290.00,
            total: 290.00
          }
        ]
      });
      setLoading(false);
      return;
    }

    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const data = await invoiceService.getInvoice(id as string);
      setInvoice(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!invoice) {
    return (
      <AppLayout companyId={companyId}>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Invoice not found</p>
              <Button onClick={() => router.push("/invoices")} className="mt-4">
                Back to Invoices
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer;
  const vehicle = Array.isArray(invoice.vehicle) ? invoice.vehicle[0] : invoice.vehicle;

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
              <StatusBadge status={invoice.status} type="invoice" />
            </div>
            <p className="text-muted-foreground mt-1">
              Created: {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Create Job</Button>
            <Button variant="outline">Send</Button>
            <Button variant="outline">Print</Button>
            {invoice.status !== "paid" && (
              <>
                <Button onClick={() => setShowFinishModal(true)}>Finish</Button>
                <Button onClick={() => setShowPaymentModal(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay
                </Button>
              </>
            )}
            <Button variant="outline">More...</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="col-span-2 space-y-6">
            {/* Bill To Section */}
            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <button
                    onClick={() => setShowCustomerDialog(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    {customer?.name}
                  </button>
                </div>
                {customer?.mobile && (
                  <p className="text-sm text-muted-foreground">Tel: {customer.mobile}</p>
                )}
                {customer?.payment_term && (
                  <p className="text-sm">Payment Term: {customer.payment_term}</p>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Section */}
            {vehicle && (
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <button
                        onClick={() => setShowVehicleDialog(true)}
                        className="text-primary hover:underline font-medium"
                      >
                        {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowChangeVehicleDialog(true)}
                    >
                      Change Vehicle
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Year: {vehicle.year}</p>
                </CardContent>
              </Card>
            )}

            {/* Items Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Description</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddItemDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Item
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Header
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowJobTypeDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Job Types
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Buy-in
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 font-semibold text-sm border-b pb-2">
                    <div className="col-span-6">DESCRIPTION</div>
                    <div className="col-span-2 text-right">QTY</div>
                    <div className="col-span-2 text-right">RATE</div>
                    <div className="col-span-2 text-right">TOTAL</div>
                  </div>
                  {invoice.items?.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 text-sm py-2 border-b">
                      <div className="col-span-6">{item.description}</div>
                      <div className="col-span-2 text-right">{item.qty}</div>
                      <div className="col-span-2 text-right">${item.rate?.toFixed(2)}</div>
                      <div className="col-span-2 text-right font-semibold">${item.total?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* Discount Section */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Total Excl. GST</span>
                    <span className="font-semibold">${((invoice.total_amount || 0) / 1.15).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>GST</span>
                    <span className="font-semibold">${((invoice.total_amount || 0) - (invoice.total_amount || 0) / 1.15).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Total</span>
                    <span className="font-semibold">${(invoice.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-bold mt-4 pt-4 border-t">
                    <span>Balance Due</span>
                    <span className="text-primary">${(invoice.balance || invoice.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Note */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Note</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes for this invoice..."
                  rows={3}
                  defaultValue={invoice.notes}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Related Info */}
          <div className="space-y-6">
            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={invoice.status === "paid"}
                >
                  No payment
                </Button>
              </CardContent>
            </Card>

            {/* COGS Section */}
            <Card>
              <CardHeader>
                <CardTitle>COGS</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Close
                </Button>
              </CardContent>
            </Card>

            {/* Related Bills Section */}
            <Card>
              <CardHeader>
                <CardTitle>Related Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Close
                </Button>
              </CardContent>
            </Card>

            {/* Related Credit Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Related Credit Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No credit notes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{customer?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Customer Details</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium mt-1">{customer?.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium mt-1">{customer?.email || "N/A"}</p>
                </div>
                <div>
                  <Label>Mobile</Label>
                  <p className="text-sm font-medium mt-1">{customer?.mobile || "N/A"}</p>
                </div>
                <div>
                  <Label>Payment Term</Label>
                  <p className="text-sm font-medium mt-1">{customer?.payment_term || "N/A"}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => router.push(`/customers/${customer?.id}`)}>
                  Full Details
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Vehicle Details Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{vehicle?.registration_number} - {vehicle?.make} {vehicle?.model}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reg No#</Label>
                <p className="text-sm font-medium mt-1">{vehicle?.registration_number}</p>
              </div>
              <div>
                <Label>Make</Label>
                <p className="text-sm font-medium mt-1">{vehicle?.make}</p>
              </div>
              <div>
                <Label>Model</Label>
                <p className="text-sm font-medium mt-1">{vehicle?.model}</p>
              </div>
              <div>
                <Label>Year</Label>
                <p className="text-sm font-medium mt-1">{vehicle?.year}</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVehicleDialog(false);
                  setShowChangeVehicleDialog(true);
                }}
              >
                Change To Different Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Vehicle Dialog */}
      <Dialog open={showChangeVehicleDialog} onOpenChange={setShowChangeVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Vehicle</Label>
              <Input placeholder="Search by registration number..." className="mt-1" />
            </div>
            <p className="text-sm text-muted-foreground">
              Only vehicles connected to this customer will appear
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowChangeVehicleDialog(false)}>
                Cancel
              </Button>
              <Button>Change</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          invoice={invoice}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            loadInvoice();
          }}
        />
      )}

      {/* Finish Modal */}
      {showFinishModal && (
        <JobFinishModal
          open={showFinishModal}
          onClose={() => setShowFinishModal(false)}
          job={invoice}
          onComplete={() => {
            setShowFinishModal(false);
            loadInvoice();
          }}
        />
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input placeholder="Item description..." className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Qty</Label>
                <Input type="number" defaultValue="1" className="mt-1" />
              </div>
              <div>
                <Label>Rate</Label>
                <Input type="number" step="0.01" className="mt-1" />
              </div>
              <div>
                <Label>Total</Label>
                <Input type="number" step="0.01" disabled className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                Cancel
              </Button>
              <Button>Add Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Type Dialog */}
      <Dialog open={showJobTypeDialog} onOpenChange={setShowJobTypeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Job Types</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select job type:</p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Puncture Car
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Puncture CAR/SU/4x4
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Pre Purchase Inspection
              </Button>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowJobTypeDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}