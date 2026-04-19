import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Car, Calendar, FileText, Wrench, Merge, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function VehicleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showPaymentInstructionDialog, setShowPaymentInstructionDialog] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadVehicleData();
    }
  }, [id]);

  const loadVehicleData = async () => {
    if (!id || typeof id !== "string") return;
    
    setLoading(true);

    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (vehicleData) {
      setVehicle(vehicleData);

      // Load customer
      if (vehicleData.customer_id) {
        const { data: customerData } = await supabase
          .from("customers")
          .select("*")
          .eq("id", vehicleData.customer_id)
          .single();
        setCustomer(customerData);
      }

      // Load service history (invoices)
      const { data: historyData } = await supabase
        .from("invoices")
        .select("*")
        .eq("vehicle_id", id)
        .order("invoice_date", { ascending: false });
      setServiceHistory(historyData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return (
      <AppLayout companyId="">
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Vehicle not found</p>
              <Button onClick={() => router.push("/vehicles")} className="mt-4">
                Back to Vehicles
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
              <h1 className="font-heading text-3xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <Badge variant="outline">Add tag</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Reg No#: {vehicle.registration_number}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/vehicles/${id}`)}>
              Vehicle List
            </Button>

            <Button variant="outline">
              Service History
            </Button>

            <Button variant="outline">
              New
            </Button>

            <Button variant="outline" onClick={() => setShowPaymentInstructionDialog(true)}>
              Payment Instruction
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Merge/Delete
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
                  Transfer Vehicle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Merge Vehicle
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Vehicle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration Number</Label>
                    <p className="text-sm font-medium">{vehicle.registration_number}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Odometer Unit</Label>
                    <p className="text-sm font-medium">Kms</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Make</Label>
                    <p className="text-sm font-medium">{vehicle.make}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Model</Label>
                    <p className="text-sm font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Year</Label>
                    <p className="text-sm font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Body</Label>
                    <p className="text-sm font-medium">{vehicle.body_type || "Ute"}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium">NEXT SERVICE NOTE/TODO: (Not Available)</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">WOF Due:</span> N/A
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registration Due:</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Job Date:</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Service:</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Service Odometer:</span> Kms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Service History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>More Info</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceHistory.map((service) => (
                      <TableRow 
                        key={service.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/invoices/${service.id}`)}
                      >
                        <TableCell>{new Date(service.invoice_date).toLocaleDateString()}</TableCell>
                        <TableCell>{service.notes || "-"}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>${(service.total_amount || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {serviceHistory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No service history
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm">←</Button>
                  <span className="text-sm">1</span>
                  <Button variant="outline" size="sm">→</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle>Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => router.push(`/customers/${customer.id}`)}
                    className="text-primary hover:underline font-medium"
                  >
                    {customer.name}
                  </button>
                  {customer.mobile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Tel: {customer.mobile}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Vehicle Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{vehicle.year} {vehicle.make} {vehicle.model}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Change Vehicle To</Label>
              <div className="relative mt-1">
                <Input placeholder="Search customer..." />
                <Button size="sm" className="absolute right-1 top-1">
                  🔍
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowTransferDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Change</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Instruction Dialog */}
      <Dialog open={showPaymentInstructionDialog} onOpenChange={setShowPaymentInstructionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Instruction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Enter payment instructions..." />
            <div className="flex gap-2">
              <Button onClick={() => setShowPaymentInstructionDialog(false)} variant="outline" className="flex-1">
                Close
              </Button>
              <Button className="flex-1">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}