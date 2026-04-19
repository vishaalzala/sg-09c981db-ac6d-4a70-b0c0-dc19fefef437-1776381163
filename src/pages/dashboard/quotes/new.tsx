import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function NewQuote() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    quote_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    description: "",
    notes: ""
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerVehicles();
    }
  }, [selectedCustomer]);

  const loadCustomerVehicles = async () => {
    if (!selectedCustomer) return;
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("customer_id", selectedCustomer.id);
    setCustomerVehicles(data || []);
  };

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
    if (!selectedCustomer) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("quotes")
      .insert([{
        company_id: companyId,
        customer_id: selectedCustomer.id,
        vehicle_id: selectedVehicle?.id || null,
        quote_date: formData.quote_date,
        expiry_date: formData.expiry_date || null,
        description: formData.description,
        notes: formData.notes,
        status: "draft"
      }])
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create quote", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Quote created successfully" });
    router.push(`/dashboard/quotes/${data.id}`);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Left Sidebar - Customer/Vehicle Search */}
        <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">VEHICLE OWNER</Label>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {searchResults.length > 0 && (
                  <Card className="max-h-64 overflow-y-auto">
                    <CardContent className="p-2">
                      {searchResults.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => selectCustomer(customer)}
                          className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
                        >
                          <p className="font-medium text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.mobile}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {selectedCustomer && (
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{selectedCustomer.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedCustomer.mobile}</p>
                          <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {selectedCustomer && (
              <div>
                <Label className="text-sm font-semibold">VEHICLE</Label>
                <div className="mt-2 space-y-2">
                  {customerVehicles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No vehicles found</p>
                  ) : (
                    customerVehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors",
                          selectedVehicle?.id === vehicle.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <p className="font-medium text-sm">{vehicle.registration_number}</p>
                        <p className="text-xs opacity-80">{vehicle.make} {vehicle.model}</p>
                        <p className="text-xs opacity-80">{vehicle.year}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">New Quote</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quote Date</Label>
                      <Input
                        type="date"
                        value={formData.quote_date}
                        onChange={(e) => setFormData({ ...formData, quote_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <Input
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Quote description..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Summary */}
        <div className="w-80 border-l bg-muted/30 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}