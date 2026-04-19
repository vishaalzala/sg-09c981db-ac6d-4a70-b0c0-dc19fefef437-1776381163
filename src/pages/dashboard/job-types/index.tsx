import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

export default function JobTypes() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [jobTypes, setJobTypes] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    estimated_hours: "",
    estimated_cost: ""
  });

  const categories = [
    "Advance Car Service",
    "Air Conditioning",
    "Auto Electrical",
    "Automatic Transmission Flush",
    "Basic Car Service",
    "Brake Fluid Flush",
    "Brake Pads",
    "Comprehensive Service",
    "Cooling Systems",
    "Diagnostic Scan",
    "Diesel Service",
    "European Service",
    "LPG/CNG WOF (NZTA official)",
    "Power Steering Flush",
    "Pre-Purchase Inspection",
    "Puncture Car",
    "Puncture CAR/SUV/4x4",
    "Suspension & Shock Absorbers",
    "Tub repair",
    "Warrant of Fitness - Car",
    "Warrant of Fitness - Trailer/CT",
    "Wheel Alignment Car"
  ];

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadJobTypes(c.id);
      }
    });
  }, []);

  const loadJobTypes = async (cId: string) => {
    const { data } = await supabase
      .from("job_types")
      .select("*")
      .eq("company_id", cId)
      .order("name");
    setJobTypes(data || []);
  };

  const handleCreate = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from("job_types")
      .insert({
        company_id: companyId,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        estimated_hours: parseFloat(formData.estimated_hours) || null,
        estimated_cost: parseFloat(formData.estimated_cost) || null
      });

    if (error) {
      toast({ title: "Error", description: "Failed to create job type", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Job type created successfully" });
    setShowDialog(false);
    setFormData({ name: "", category: "", description: "", estimated_hours: "", estimated_cost: "" });
    loadJobTypes(companyId);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Job Types</h1>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Job Type
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category}>
              <CardContent className="p-4">
                <h3 className="font-semibold">{category}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {jobTypes.filter(jt => jt.category === category).length} job types
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Job Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                />
              </div>
              <div>
                <Label>Estimated Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}