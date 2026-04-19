import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function VehicleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string>("");

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
      setCompanyId(vehicleData.company_id);

      if (vehicleData.customer_id) {
        const { data: customerData } = await supabase
          .from("customers")
          .select("*")
          .eq("id", vehicleData.customer_id)
          .single();
        setCustomer(customerData);
      }

      const { data: historyData } = await supabase
        .from("invoices")
        .select("*")
        .eq("vehicle_id", id)
        .order("invoice_date", { ascending: false });
      setServiceHistory(historyData || []);
    }

    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return <div>Vehicle not found</div>;

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold">{vehicle.registration_number} - {vehicle.make} {vehicle.model}</h1>
          <div className="flex gap-2">
            <Button variant="outline">Service History</Button>
            <Button variant="outline">Merge/Transfer/Delete</Button>
            <Button>New Job</Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Registration Number</Label>
                  <p className="text-sm font-medium">{vehicle.registration_number}</p>
                </div>
                <div>
                  <Label>Make</Label>
                  <p className="text-sm font-medium">{vehicle.make || "N/A"}</p>
                </div>
                <div>
                  <Label>Model</Label>
                  <p className="text-sm font-medium">{vehicle.model || "N/A"}</p>
                </div>
                <div>
                  <Label>Year</Label>
                  <p className="text-sm font-medium">{vehicle.year || "N/A"}</p>
                </div>
                <div>
                  <Label>Color</Label>
                  <p className="text-sm font-medium">{vehicle.color || "N/A"}</p>
                </div>
                <div>
                  <Label>VIN</Label>
                  <p className="text-sm font-medium">{vehicle.vin || "N/A"}</p>
                </div>
                <div>
                  <Label>Odometer</Label>
                  <p className="text-sm font-medium">{vehicle.odometer ? `${vehicle.odometer} km` : "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DATE</TableHead>
                    <TableHead>INVOICE #</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                    <TableHead>AMOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No service history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    serviceHistory.map((record) => (
                      <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/invoices/${record.id}`)}>
                        <TableCell>{new Date(record.invoice_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{record.invoice_number}</TableCell>
                        <TableCell>{record.notes || "N/A"}</TableCell>
                        <TableCell>${record.total_amount?.toFixed(2) || "0.00"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}