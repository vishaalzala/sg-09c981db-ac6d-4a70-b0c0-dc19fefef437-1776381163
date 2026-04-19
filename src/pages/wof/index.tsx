import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";

export default function WOFInspections() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inspections, setInspections] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "passed" | "failed">("all");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadInspections(c.id);
      }
    });
  }, []);

  const loadInspections = async (cId: string) => {
    let query = supabase
      .from("wof_inspections")
      .select(`
        *,
        vehicles (
          registration,
          make,
          model,
          year
        ),
        customers (
          name,
          phone,
          email
        )
      `)
      .eq("company_id", cId)
      .order("inspection_date", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setInspections(data || []);
  };

  useEffect(() => {
    if (companyId) {
      loadInspections(companyId);
    }
  }, [filter, companyId]);

  const filteredInspections = inspections.filter(inspection => {
    const vehicleInfo = `${inspection.vehicles?.registration} ${inspection.vehicles?.make} ${inspection.vehicles?.model}`.toLowerCase();
    const customerInfo = inspection.customers?.name?.toLowerCase() || "";
    return vehicleInfo.includes(searchTerm.toLowerCase()) || customerInfo.includes(searchTerm.toLowerCase());
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">WOF Inspections</h1>
          <Button onClick={() => router.push("/wof/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New WOF Inspection
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Inspections</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inspections.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inspections.filter(i => i.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {inspections.filter(i => i.status === "passed").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {inspections.filter(i => i.status === "failed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by vehicle or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filter === "passed" ? "default" : "outline"}
              onClick={() => setFilter("passed")}
            >
              Passed
            </Button>
            <Button
              variant={filter === "failed" ? "default" : "outline"}
              onClick={() => setFilter("failed")}
            >
              Failed
            </Button>
          </div>
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
                  <TableHead>EXPIRY DATE</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection) => (
                  <TableRow
                    key={inspection.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/wof/${inspection.id}`)}
                  >
                    <TableCell>
                      {new Date(inspection.inspection_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {inspection.vehicles?.registration} - {inspection.vehicles?.make} {inspection.vehicles?.model}
                    </TableCell>
                    <TableCell>{inspection.customers?.name}</TableCell>
                    <TableCell>{inspection.inspector_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inspection.status === "passed"
                            ? "default"
                            : inspection.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {inspection.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inspection.expiry_date
                        ? new Date(inspection.expiry_date).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
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