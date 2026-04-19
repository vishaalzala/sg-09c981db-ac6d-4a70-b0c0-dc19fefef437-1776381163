import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function CustomerDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [sendMethod, setSendMethod] = useState<"sms" | "email">("email");

  useEffect(() => {
    if (id && typeof id === "string") {
      loadCustomerData();
    }
  }, [id]);

  const loadCustomerData = async () => {
    if (!id || typeof id !== "string") return;
    
    setLoading(true);

    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (customerData) {
      setCustomer(customerData);
      setCompanyId(customerData.company_id);

      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", id);
      setVehicles(vehiclesData || []);

      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });
      setInvoices(invoicesData || []);
    }

    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold">{customer.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline">Statement</Button>
            <Button variant="outline">Send</Button>
            <Button>New</Button>
            <Button variant="outline">Merge/Delete</Button>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Customer Details</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm font-medium">{customer.name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium">{customer.email || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <p className="text-sm font-medium">{customer.mobile || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm font-medium">{customer.phone || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <p className="text-sm font-medium">{customer.address || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <p className="text-sm font-medium">{customer.notes || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>ROLE</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>PHONE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No contacts added
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>REG #</TableHead>
                      <TableHead>MAKE</TableHead>
                      <TableHead>MODEL</TableHead>
                      <TableHead>YEAR</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No vehicles found
                        </TableCell>
                      </TableRow>
                    ) : (
                      vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}>
                          <TableCell className="font-medium">{vehicle.registration_number}</TableCell>
                          <TableCell>{vehicle.make}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell>{vehicle.year}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>INVOICE #</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>AMOUNT</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                          <TableCell>${invoice.total_amount?.toFixed(2) || "0.00"}</TableCell>
                          <TableCell>{invoice.status}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}