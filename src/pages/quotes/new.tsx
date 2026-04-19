import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSelector } from "@/components/CustomerSelector";
import { VehicleSelector } from "@/components/VehicleSelector";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

export default function NewQuotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!selectedCustomer) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Quote created successfully" });
    router.push("/quotes");
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">New Quote</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/quotes")}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Quote</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Customer Section */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Customer *</Label>
                  <CustomerSelector
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    companyId={companyId}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Section */}
            {selectedCustomer && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>Vehicle</Label>
                    <VehicleSelector
                      value={selectedVehicle}
                      onChange={setSelectedVehicle}
                      customerId={selectedCustomer?.id}
                      companyId={companyId}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quote Details */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quote Number</Label>
                    <Input
                      value={quoteNumber}
                      onChange={(e) => setQuoteNumber(e.target.value)}
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <Label>Quote Date</Label>
                    <Input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this quote..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Quote Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}