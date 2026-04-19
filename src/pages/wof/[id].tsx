import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Save, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function WOFInspectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<any>(null);
  const [checklist, setChecklist] = useState<any>({
    brakes: false,
    steering: false,
    suspension: false,
    tyres: false,
    lights: false,
    windscreen: false,
    mirrors: false,
    seatbelts: false,
    exhaust: false,
    structure: false
  });

  useEffect(() => {
    if (id && typeof id === "string") {
      loadInspection();
    }
  }, [id]);

  const loadInspection = async () => {
    if (!id || typeof id !== "string") return;

    const { data } = await supabase
      .from("wof_inspections")
      .select(`
        *,
        vehicles (
          registration,
          make,
          model,
          year,
          vin
        ),
        customers (
          name,
          phone,
          email,
          address
        )
      `)
      .eq("id", id)
      .single();

    if (data) {
      setInspection(data);
      if (data.checklist) {
        setChecklist(data.checklist);
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!id || typeof id !== "string") return;

    const allPassed = Object.values(checklist).every(v => v === true);
    const status = allPassed ? "passed" : "failed";

    const { error } = await supabase
      .from("wof_inspections")
      .update({
        checklist,
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save inspection",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Inspection saved successfully"
    });

    loadInspection();
  };

  if (loading) {
    return (
      <AppLayout companyId="">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!inspection) {
    return (
      <AppLayout companyId="">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">Inspection not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">
              WOF Inspection #{inspection.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              {inspection.vehicles?.registration} - {inspection.vehicles?.make} {inspection.vehicles?.model}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={
                  inspection.status === "passed"
                    ? "default"
                    : inspection.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
                className="text-lg"
              >
                {inspection.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Inspection Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {new Date(inspection.inspection_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expiry Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {inspection.expiry_date
                  ? new Date(inspection.expiry_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="checklist">
          <TabsList>
            <TabsTrigger value="checklist">Inspection Checklist</TabsTrigger>
            <TabsTrigger value="details">Vehicle Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>WOF Inspection Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.brakes}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, brakes: checked as boolean })
                      }
                    />
                    <Label className="text-base">Brakes (Service & Parking)</Label>
                  </div>
                  {checklist.brakes ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.steering}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, steering: checked as boolean })
                      }
                    />
                    <Label className="text-base">Steering System</Label>
                  </div>
                  {checklist.steering ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.suspension}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, suspension: checked as boolean })
                      }
                    />
                    <Label className="text-base">Suspension & Shock Absorbers</Label>
                  </div>
                  {checklist.suspension ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.tyres}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, tyres: checked as boolean })
                      }
                    />
                    <Label className="text-base">Tyres & Wheels</Label>
                  </div>
                  {checklist.tyres ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.lights}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, lights: checked as boolean })
                      }
                    />
                    <Label className="text-base">Lights & Indicators</Label>
                  </div>
                  {checklist.lights ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.windscreen}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, windscreen: checked as boolean })
                      }
                    />
                    <Label className="text-base">Windscreen & Wipers</Label>
                  </div>
                  {checklist.windscreen ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.mirrors}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, mirrors: checked as boolean })
                      }
                    />
                    <Label className="text-base">Mirrors</Label>
                  </div>
                  {checklist.mirrors ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.seatbelts}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, seatbelts: checked as boolean })
                      }
                    />
                    <Label className="text-base">Seatbelts</Label>
                  </div>
                  {checklist.seatbelts ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.exhaust}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, exhaust: checked as boolean })
                      }
                    />
                    <Label className="text-base">Exhaust System</Label>
                  </div>
                  {checklist.exhaust ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checklist.structure}
                      onCheckedChange={(checked) =>
                        setChecklist({ ...checklist, structure: checked as boolean })
                      }
                    />
                    <Label className="text-base">Body & Structure</Label>
                  </div>
                  {checklist.structure ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Registration</Label>
                    <p className="font-medium">{inspection.vehicles?.registration}</p>
                  </div>
                  <div>
                    <Label>VIN</Label>
                    <p className="font-medium">{inspection.vehicles?.vin || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Make</Label>
                    <p className="font-medium">{inspection.vehicles?.make}</p>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <p className="font-medium">{inspection.vehicles?.model}</p>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <p className="font-medium">{inspection.vehicles?.year}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Customer</Label>
                  <p className="font-medium">{inspection.customers?.name}</p>
                  <p className="text-sm text-muted-foreground">{inspection.customers?.phone}</p>
                  <p className="text-sm text-muted-foreground">{inspection.customers?.email}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Inspector Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any additional notes about this inspection..."
                  rows={10}
                  defaultValue={inspection.notes || ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}