import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

export default function NewStock() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    part_number: "",
    description: "",
    location: "",
    supplier_name: "",
    quantity_on_hand: "",
    quantity_allocated: "",
    cost_price: "",
    sell_price: "",
    reorder_level: "",
    notes: "",
    generate_barcode: false,
    track_serial_batch: false,
    auto_pricing: false
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const handleSave = async () => {
    if (!companyId) return;
    if (!formData.description) {
      toast({ title: "Error", description: "Name/Description is required", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("inventory_items")
      .insert({
        company_id: companyId,
        part_number: formData.part_number,
        description: formData.description,
        location: formData.location,
        supplier_name: formData.supplier_name,
        quantity_on_hand: parseInt(formData.quantity_on_hand) || 0,
        quantity_allocated: parseInt(formData.quantity_allocated) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        sell_price: parseFloat(formData.sell_price) || 0,
        reorder_level: parseInt(formData.reorder_level) || 0,
        notes: formData.notes
      });

    if (error) {
      toast({ title: "Error", description: "Failed to create stock item", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Stock item created successfully" });
    router.push(`/dashboard/inventory`);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">New Stock</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Item No# *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.part_number}
                      onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                    />
                    <Button variant="outline" size="icon" className="shrink-0"><span className="text-xs">B</span></Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox id="gen_barcode" checked={formData.generate_barcode} onCheckedChange={(c) => setFormData({ ...formData, generate_barcode: !!c })} />
                    <Label htmlFor="gen_barcode" className="text-xs font-normal">Generate Barcode if Empty</Label>
                  </div>
                </div>

                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="track_serial" checked={formData.track_serial_batch} onCheckedChange={(c) => setFormData({ ...formData, track_serial_batch: !!c })} />
                  <Label htmlFor="track_serial" className="text-xs font-normal">Track Serial/Batch No</Label>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox id="auto_pricing" checked={formData.auto_pricing} onCheckedChange={(c) => setFormData({ ...formData, auto_pricing: !!c })} />
                  <Label htmlFor="auto_pricing" className="text-xs font-normal">Auto Pricing Update (based on cost price)</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Buy Price (Excl GST)</Label>
                    <Input
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Markup %</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sell Price (Excl GST)</Label>
                    <Input
                      type="number"
                      value={formData.sell_price}
                      onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Margin %</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Stock Alert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Min Quantity (Reorder Level)</Label>
                  <Input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Max Quantity</Label>
                  <Input type="number" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Current Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quantity On Hand</Label>
                  <Input
                    type="number"
                    value={formData.quantity_on_hand}
                    onChange={(e) => setFormData({ ...formData, quantity_on_hand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Quantity Allocated</Label>
                  <Input
                    type="number"
                    value={formData.quantity_allocated}
                    onChange={(e) => setFormData({ ...formData, quantity_allocated: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}