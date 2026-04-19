import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function JobTypes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypes, setJobTypes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newJobType, setNewJobType] = useState({
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
    "LPG/CNG WOF (NZ/TI) official",
    "Power Steering Flush",
    "Pre-Purchase Inspection",
    "Puncture Car",
    "Purchase CAR/SUV/4x4",
    "Suspension & Shock Absorbers",
    "Tune repair",
    "Warrant of Fitness - Car",
    "Warrant of Fitness - Trailer/CT",
    "Wheel Alignment Car"
  ];

  useEffect(() => {
    loadJobTypes();
  }, []);

  const loadJobTypes = async () => {
    const { data } = await supabase
      .from("job_types")
      .select("*")
      .order("name");
    setJobTypes(data || []);
  };

  const handleCreateJobType = async () => {
    const { error } = await supabase
      .from("job_types")
      .insert([{
        name: newJobType.name,
        category: newJobType.category,
        description: newJobType.description,
        estimated_hours: parseFloat(newJobType.estimated_hours) || null,
        estimated_cost: parseFloat(newJobType.estimated_cost) || null
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create job type",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Job type created successfully"
    });

    setShowNewDialog(false);
    setNewJobType({
      name: "",
      category: "",
      description: "",
      estimated_hours: "",
      estimated_cost: ""
    });
    loadJobTypes();
  };

  const filteredJobTypes = jobTypes.filter(jt => {
    const matchesSearch = jt.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || jt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Job Types</h1>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Job Type
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedCategory === "" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Job Types List */}
          <div className="col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search job types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredJobTypes.map((jobType) => (
                    <div
                      key={jobType.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{jobType.name}</h3>
                          {jobType.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {jobType.description}
                            </p>
                          )}
                          {jobType.category && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Category: {jobType.category}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {jobType.estimated_hours && (
                            <p className="text-sm">{jobType.estimated_hours}h</p>
                          )}
                          {jobType.estimated_cost && (
                            <p className="text-sm font-medium">
                              ${jobType.estimated_cost.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredJobTypes.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No job types found. Click "New Job Type" to create one.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Job Type Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Job Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={newJobType.name}
                  onChange={(e) => setNewJobType({ ...newJobType, name: e.target.value })}
                  placeholder="e.g., Basic Car Service"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={newJobType.category}
                  onChange={(e) => setNewJobType({ ...newJobType, category: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newJobType.description}
                onChange={(e) => setNewJobType({ ...newJobType, description: e.target.value })}
                rows={3}
                placeholder="Describe what this job type includes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={newJobType.estimated_hours}
                  onChange={(e) => setNewJobType({ ...newJobType, estimated_hours: e.target.value })}
                  placeholder="e.g., 2.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Cost</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newJobType.estimated_cost}
                  onChange={(e) => setNewJobType({ ...newJobType, estimated_cost: e.target.value })}
                  placeholder="e.g., 250.00"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateJobType} className="flex-1">
                Save
              </Button>
              <Button onClick={() => setShowNewDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}