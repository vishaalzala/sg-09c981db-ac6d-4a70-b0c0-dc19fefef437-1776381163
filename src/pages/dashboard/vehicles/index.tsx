import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";

export default function VehiclesList() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadVehicles(c.id);
      }
    });
  }, []);

  const loadVehicles = async (cId: string) => {
    const { data } = await supabase
      .from("vehicles")
      .select("*, customer:customers(name, mobile)")
      .eq("company_id", cId)
      .order("registration_number");
    setVehicles(data || []);
  };

  const filteredVehicles = vehicles.filter(v => 
    v.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Vehicles</h1>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download</Button>
            <Button onClick={() => router.push("/dashboard/vehicles/new")}>
              <Plus className="h-4 w-4 mr-2" /> New Vehicle
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>REG NO#</TableHead>
                  <TableHead>MAKE</TableHead>
                  <TableHead>MODEL</TableHead>
                  <TableHead>YEAR</TableHead>
                  <TableHead>OWNER NAME</TableHead>
                  <TableHead>PHONE</TableHead>
                  <TableHead>LAST JOB DATE</TableHead>
                  <TableHead>NEXT SERVICE</TableHead>
                  <TableHead>WOF DUE DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow 
                    key={vehicle.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
                  >
                    <TableCell className="font-medium">{vehicle.registration_number}</TableCell>
                    <TableCell>{vehicle.make || "N/A"}</TableCell>
                    <TableCell>{vehicle.model || "N/A"}</TableCell>
                    <TableCell>{vehicle.year || "N/A"}</TableCell>
                    <TableCell>{vehicle.customer?.name || "N/A"}</TableCell>
                    <TableCell>{vehicle.customer?.mobile || "N/A"}</TableCell>
                    <TableCell>{vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{vehicle.service_due_date ? new Date(vehicle.service_due_date).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{vehicle.wof_expiry ? new Date(vehicle.wof_expiry).toLocaleDateString() : "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}