import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { Search } from "lucide-react";

export default function NewVehicle() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    registration_number: "",
    make: "",
    model: "",
    year: "",
    vin: "",
    engine: "",
    color: "",
    odometer: "",
    transmission: "",
    fuel_type: "",
    body_type: "",
    notes: ""
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", companyId)
      .or(`name.ilike.%${term}%,mobile.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(10);

    setSearchResults(data || []);
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    setSearchTerm("");
  };

  const handleSave = async () => {
    if (!companyId || !selectedCustomer) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        company_id: companyId,
        customer_id: selectedCustomer.id,
        registration_number: formData.registration_number,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year) || null,
        vin: formData.vin,
        colour: formData.color,
        engine_size: formData.engine,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        body_type: formData.body_type,
        odometer: parseInt(formData.odometer) || null,
        notes: formData.notes
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create vehicle", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Vehicle created successfully" });
    router.push(`/dashboard/vehicles/${data.id}`);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">New Vehicle</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Customer</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, mobile, or email..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {searchResults.length > 0 && (
                  <Card className="mt-2 max-h-64 overflow-y-auto">
                    <CardContent className="p-2">
                      {searchResults.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
                        >
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.mobile}</p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {selectedCustomer && (
                  <Card className="mt-2">
                    <CardContent className="p-3">
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.mobile}</p>
                      <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Registration Number *</Label>
                <Input
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  placeholder="e.g., ABC123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Make</Label>
                  <Input
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., Corolla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>VIN</Label>
                <Input
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  placeholder="Vehicle Identification Number"
                />
              </div>

              <div>
                <Label>Engine</Label>
                <Input
                  value={formData.engine}
                  onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                />
              </div>

              <div>
                <Label>Odometer (km)</Label>
                <Input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transmission</Label>
                  <Input
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    placeholder="e.g., Automatic"
                  />
                </div>
                <div>
                  <Label>Fuel Type</Label>
                  <Input
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    placeholder="e.g., Petrol"
                  />
                </div>
              </div>

              <div>
                <Label>Body Type</Label>
                <Input
                  value={formData.body_type}
                  onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                  placeholder="e.g., Sedan"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}