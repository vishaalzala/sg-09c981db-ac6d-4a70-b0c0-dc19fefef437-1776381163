import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

export default function NewWOF() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [formData, setFormData] = useState({
    vehicle_id: "",
    inspection_date: new Date().toISOString().split("T")[0],
    inspector_name: "",
    notes: ""
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const handleSave = async () => {
    if (!companyId) return;

    const { data, error } = await supabase
      .from("wof_inspections")
      .insert({
        company_id: companyId,
        vehicle_id: formData.vehicle_id,
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector_name,
        notes: formData.notes,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create WOF inspection", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "WOF inspection created" });
    router.push(`/dashboard/wof/${data.id}`);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>New WOF Inspection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vehicle ID</Label>
              <Input value={formData.vehicle_id} onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})} />
            </div>
            <div>
              <Label>Inspection Date</Label>
              <Input type="date" value={formData.inspection_date} onChange={(e) => setFormData({...formData, inspection_date: e.target.value})} />
            </div>
            <div>
              <Label>Inspector Name</Label>
              <Input value={formData.inspector_name} onChange={(e) => setFormData({...formData, inspector_name: e.target.value})} />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
            <Button onClick={handleSave}>Save WOF Inspection</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}