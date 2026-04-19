import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

type InspectionStatus = "pass" | "fail" | "n/a" | null;

interface InspectionItem {
  id: string;
  label: string;
  status: InspectionStatus;
  failureDescription?: string;
}

interface InspectionSection {
  id: string;
  title: string;
  items: InspectionItem[];
  expanded: boolean;
}

export default function NewWOF() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [formData, setFormData] = useState({
    vehicle: "",
    reg_number: "",
    odometer: "",
    odometer_units: "Kms",
    inspection_date: new Date().toISOString().split("T")[0],
    inspector: "",
    general_notes: ""
  });

  const [sections, setSections] = useState<InspectionSection[]>([
    {
      id: "tyres",
      title: "Tyres & Wheels",
      expanded: true,
      items: [
        { id: "tyre_depth", label: "Tyre tread depth (min 1.5mm)", status: null },
        { id: "tyre_condition", label: "Tyre condition (no cuts, bulges, damage)", status: null },
        { id: "tyre_pressure", label: "Tyre pressure within specs", status: null },
        { id: "spare_tyre", label: "Spare tyre condition (if fitted)", status: null },
        { id: "wheel_rim", label: "Wheel rim condition", status: null }
      ]
    },
    {
      id: "brakes",
      title: "Brakes",
      expanded: false,
      items: [
        { id: "brake_pads", label: "Brake pad thickness adequate", status: null },
        { id: "brake_discs", label: "Brake disc/s drums condition", status: null },
        { id: "brake_lines", label: "Brake lines — no leaks or damage", status: null },
        { id: "handbrake", label: "Handbrake operation", status: null },
        { id: "brake_fluid", label: "Brake fluid level", status: null }
      ]
    },
    {
      id: "lights",
      title: "Lights",
      expanded: false,
      items: [
        { id: "headlights", label: "Headlights — both working", status: null },
        { id: "headlight_aim", label: "Headlight aim correct", status: null },
        { id: "taillights", label: "Taillights working", status: null },
        { id: "brake_lights", label: "Brake lights working", status: null },
        { id: "indicators", label: "Indicators front & rear", status: null },
        { id: "number_plate_light", label: "Number plate light", status: null },
        { id: "hazard_lights", label: "Hazard lights", status: null }
      ]
    },
    {
      id: "steering_mirrors",
      title: "Steering & Mirrors",
      expanded: false,
      items: [
        { id: "windscreen", label: "Windscreen — no cracks or visual obs", status: null },
        { id: "wipers", label: "Windscreen wipers working", status: null },
        { id: "washer", label: "Washer fluid &top working", status: null },
        { id: "driver_mirror", label: "Driver side mirror secure", status: null },
        { id: "rear_mirror", label: "Rear side mirror secure", status: null }
      ]
    },
    {
      id: "suspension",
      title: "Steering & Suspension",
      expanded: false,
      items: [
        { id: "steering_play", label: "Steering play within limits", status: null },
        { id: "tie_rods", label: "Tie rod ends — no excess wear", status: null },
        { id: "ball_joints", label: "Ball joints — no excess wear", status: null },
        { id: "shock_absorbers", label: "Shock absorbers — no leaks", status: null },
        { id: "wheel_alignment", label: "Wheel alignment acceptable", status: null }
      ]
    },
    {
      id: "body",
      title: "Body & Structure",
      expanded: false,
      items: [
        { id: "body_panels", label: "Body panels — no sharp edges", status: null },
        { id: "structural_rust", label: "Structural corrosion (rust)", status: null },
        { id: "doors", label: "Doors open/close/latch properly", status: null },
        { id: "bonnet_latch", label: "Bonnet latch secure", status: null }
      ]
    },
    {
      id: "seatbelts",
      title: "Seatbelts & Occupant Protection",
      expanded: false,
      items: [
        { id: "driver_seatbelt", label: "Driver seatbelt — fastens & retracts", status: null },
        { id: "passenger_seatbelts", label: "Passenger seatbelts", status: null },
        { id: "seatbelt_condition", label: "Seatbelt condition — no fraying", status: null },
        { id: "airbag_warning", label: "Airbag warning lights (if equipped)", status: null }
      ]
    },
    {
      id: "engine",
      title: "Engine & Fuel System",
      expanded: false,
      items: [
        { id: "fuel_system", label: "Fuel system — no leaks", status: null },
        { id: "engine_mounts", label: "Engine mounts secure", status: null },
        { id: "exhaust_system", label: "Exhaust system — no leaks, secure", status: null }
      ]
    }
  ]);

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, expanded: !s.expanded } : s
    ));
  };

  const updateItemStatus = (sectionId: string, itemId: string, status: InspectionStatus) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, status, failureDescription: status === "fail" ? item.failureDescription || "" : undefined } : item
          )
        };
      }
      return section;
    }));
  };

  const updateFailureDescription = (sectionId: string, itemId: string, description: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, failureDescription: description } : item
          )
        };
      }
      return section;
    }));
  };

  const getSectionHasFail = (section: InspectionSection) => {
    return section.items.some(item => item.status === "fail");
  };

  const getOverallStatus = () => {
    const allItems = sections.flatMap(s => s.items);
    const hasFail = allItems.some(item => item.status === "fail");
    return hasFail ? "FAIL" : "PASS";
  };

  const handleSubmit = async () => {
    if (!companyId) return;

    const overallStatus = getOverallStatus().toLowerCase();
    const checklistData = sections.map(section => ({
      section: section.title,
      items: section.items.map(item => ({
        label: item.label,
        status: item.status || "n/a",
        failureDescription: item.failureDescription
      }))
    }));

    const { data, error } = await supabase
      .from("wof_inspections")
      .insert({
        company_id: companyId,
        vehicle_id: null, // Would be linked if vehicle selector was implemented
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector,
        odometer_reading: parseInt(formData.odometer) || null,
        overall_result: overallStatus,
        checklist: checklistData,
        notes: formData.general_notes,
        status: "completed"
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create WOF inspection", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "WOF inspection submitted successfully" });
    router.push(`/dashboard/wof/${data.id}`);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold">WOF Inspection</h1>
          <div className="flex items-center gap-4">
            <Badge variant={getOverallStatus() === "FAIL" ? "destructive" : "default"} className="text-lg px-4 py-2">
              {getOverallStatus()}
            </Badge>
            <select className="border rounded px-3 py-2">
              <option>Set Page</option>
            </select>
            <Button onClick={handleSubmit} size="lg">Submit Inspection</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vehicle & Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehicle</Label>
              <Input 
                value={formData.vehicle}
                onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                placeholder="Search vehicle..."
              />
            </div>
            <div>
              <Label>Reg #</Label>
              <Input 
                value={formData.reg_number}
                onChange={(e) => setFormData({...formData, reg_number: e.target.value})}
              />
            </div>
            <div>
              <Label>Odometer</Label>
              <Input 
                type="number"
                value={formData.odometer}
                onChange={(e) => setFormData({...formData, odometer: e.target.value})}
              />
            </div>
            <div>
              <Label>Odometer Units</Label>
              <select 
                className="w-full border rounded px-3 py-2"
                value={formData.odometer_units}
                onChange={(e) => setFormData({...formData, odometer_units: e.target.value})}
              >
                <option>Kms</option>
                <option>Miles</option>
              </select>
            </div>
            <div>
              <Label>Date</Label>
              <Input 
                type="date"
                value={formData.inspection_date}
                onChange={(e) => setFormData({...formData, inspection_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Inspector</Label>
              <Input 
                value={formData.inspector}
                onChange={(e) => setFormData({...formData, inspector: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {section.expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  {getSectionHasFail(section) && (
                    <Badge variant="destructive">Fail</Badge>
                  )}
                </div>
              </CardHeader>
              {section.expanded && (
                <CardContent className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-normal">{item.label}</Label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`${section.id}_${item.id}`}
                              checked={item.status === "pass"}
                              onChange={() => updateItemStatus(section.id, item.id, "pass")}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Pass</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`${section.id}_${item.id}`}
                              checked={item.status === "fail"}
                              onChange={() => updateItemStatus(section.id, item.id, "fail")}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Fail</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`${section.id}_${item.id}`}
                              checked={item.status === "n/a"}
                              onChange={() => updateItemStatus(section.id, item.id, "n/a")}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">N/A</span>
                          </label>
                        </div>
                      </div>
                      {item.status === "fail" && (
                        <div className="mt-2">
                          <Input
                            placeholder="Describe the issue"
                            value={item.failureDescription || ""}
                            onChange={(e) => updateFailureDescription(section.id, item.id, e.target.value)}
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>General Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              value={formData.general_notes}
              onChange={(e) => setFormData({...formData, general_notes: e.target.value})}
              placeholder="Add any additional notes about the inspection..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit} size="lg">Submit Inspection</Button>
        </div>
      </div>
    </AppLayout>
  );
}