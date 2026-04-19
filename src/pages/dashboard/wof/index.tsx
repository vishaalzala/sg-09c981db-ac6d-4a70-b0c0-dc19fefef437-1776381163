import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";

export default function WofInspections() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [inspections, setInspections] = useState<any[]>([]);

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadInspections(c.id);
      }
    });
  }, []);

  const loadInspections = async (cId: string) => {
    const { data } = await supabase
      .from("wof_inspections")
      .select("*, vehicle:vehicles(registration_number, make, model), customer:customers(name)")
      .eq("company_id", cId)
      .order("inspection_date", { ascending: false });
    setInspections(data || []);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">WOF Inspections</h1>
          <Button onClick={() => router.push("/dashboard/wof/new")}>
            <Plus className="h-4 w-4 mr-2" /> New WOF Inspection
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DATE</TableHead>
                  <TableHead>VEHICLE</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead>INSPECTOR</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>EXPIRY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No WOF inspections found
                    </TableCell>
                  </TableRow>
                ) : (
                  inspections.map((inspection) => (
                    <TableRow 
                      key={inspection.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/wof/${inspection.id}`)}
                    >
                      <TableCell>{new Date(inspection.inspection_date).toLocaleDateString()}</TableCell>
                      <TableCell>{inspection.vehicle?.registration_number} - {inspection.vehicle?.make} {inspection.vehicle?.model}</TableCell>
                      <TableCell>{inspection.customer?.name}</TableCell>
                      <TableCell>{inspection.inspector_name || "N/A"}</TableCell>
                      <TableCell>{inspection.status}</TableCell>
                      <TableCell>{inspection.expiry_date ? new Date(inspection.expiry_date).toLocaleDateString() : "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}