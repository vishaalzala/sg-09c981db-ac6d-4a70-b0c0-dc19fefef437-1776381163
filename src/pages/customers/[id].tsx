import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  User, Mail, Phone, MapPin, CreditCard, FileText, Car,
  Send, Merge, Trash2, Printer, MessageSquare, Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [sendMethod, setSendMethod] = useState<"sms" | "email">("email");

  useEffect(() => {
    if (id) {
      loadCustomerData();
    }
  }, [id]);

  const loadCustomerData = async () => {
    setLoading(true);

    // Load customer
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (customerData) {
      setCustomer(customerData);

      // Load vehicles
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", id);
      setVehicles(vehiclesData || []);

      // Load invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });
      setInvoices(invoicesData || []);
    }

    setLoading(false);
  };

  const handleSendStatement = () => {
    toast({
      title: "Statement Sent",
      description: `Statement sent via ${sendMethod === "email" ? "email" : "SMS"}`,
    });
    setShowStatementDialog(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!customer) {
    return (
      <AppLayout companyId="">
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Customer not found</p>
              <Button onClick={() => router.push("/customers")} className="mt-4">
                Back to Customers
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold">#{customer.id} - {customer.name}</h1>
              <Badge variant="outline">Add tag</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {customer.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <button className="hover:underline">{customer.email}</button>
                  <Copy className="h-3 w-3 cursor-pointer" />
                </div>
              )}
              {customer.mobile && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{customer.mobile}</span>
                  <Copy className="h-3 w-3 cursor-pointer" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowStatementDialog(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Statement
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setSendMethod("sms"); setShowSendDialog(true); }}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSendMethod("email"); setShowSendDialog(true); }}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline">
              New
            </Button>

            <Button variant="outline">
              Payment Instruction
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Merge/Delete
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowMergeDialog(true)}>
                  <Merge className="h-4 w-4 mr-2" />
                  Merge
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Customer Details */}
          <div className="col-span-2 space-y-6">
            <Tabs defaultValue="invoices">
              <TabsList>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
              </TabsList>

              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow 
                            key={invoice.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                          >
                            <TableCell>{invoice.invoice_number}</TableCell>
                            <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                            <TableCell>{invoice.notes || "-"}</TableCell>
                            <TableCell>${(invoice.balance || 0).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                                {invoice.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No payments recorded</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quotes">
                <Card>
                  <CardHeader>
                    <CardTitle>Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">No quotes</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Vehicle List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vehicles</CardTitle>
                  <Button size="sm" variant="outline">
                    Add Vehicle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                      className="w-full text-left p-3 rounded border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{vehicle.registration_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {vehicles.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No vehicles registered
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium">{customer.name}</p>
                </div>
                {customer.email && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium">{customer.email}</p>
                  </div>
                )}
                {customer.mobile && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Mobile</Label>
                    <p className="text-sm font-medium">{customer.mobile}</p>
                  </div>
                )}
                {customer.payment_term && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Payment Term</Label>
                    <p className="text-sm font-medium">{customer.payment_term}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Balance</Label>
                  <p className="text-sm font-medium">${(customer.balance || 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Credit Limit</Label>
                  <p className="text-sm font-medium">${(customer.credit_limit || 0).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Search for the customer you want to merge this customer into:
            </p>
            <Input placeholder="Search customer..." />
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowMergeDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Merge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {sendMethod === "email" ? "Email" : "SMS"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input defaultValue="Message from Workshop" className="mt-1" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea 
                rows={6}
                defaultValue="Dear customer,&#10;&#10;Thank you for your business.&#10;&#10;Best regards"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowSendDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Statement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleSendStatement}>
                <Mail className="h-4 w-4 mr-2" />
                Email Statement
              </Button>
              <Button variant="outline" className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}