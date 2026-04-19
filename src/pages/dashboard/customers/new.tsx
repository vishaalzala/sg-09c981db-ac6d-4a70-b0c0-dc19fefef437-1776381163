import { useState } from "react";
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
import { useEffect } from "react";

export default function NewCustomer() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    mobile: "",
    phone: "",
    address: "",
    suburb: "",
    city: "",
    postcode: "",
    contact_person: "",
    price_level: "",
    discount: "",
    source_of_business: "",
    invoice_by_posting_date: false,
    credit_limit: "",
    default_discount: "",
    enable_account_payment: false,
    enable_booking_reminder: false,
    enable_service_reminder: false,
    enable_marketing_email: false,
    send_communication_via_email: false,
    notes: ""
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const handleSave = async () => {
    if (!companyId) return;

    const typeElement = document.querySelector('input[name="type"]:checked') as HTMLInputElement;
    const isCompany = typeElement?.value === 'company';

    const { data, error } = await supabase
      .from("customers")
      .insert({
        company_id: companyId,
        name: isCompany && formData.company_name ? formData.company_name : formData.name,
        is_company: isCompany,
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.phone,
        physical_address: formData.address,
        physical_city: formData.city,
        physical_postal_code: formData.postcode,
        source_of_business: formData.source_of_business,
        notes: formData.notes,
        marketing_consent: formData.enable_marketing_email
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create customer", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Customer created successfully" });
    router.push(`/dashboard/customers/${data.id}`);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">New Customer</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="type" value="company" className="w-4 h-4" />
                      <span className="text-sm">Company</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="type" value="individual" defaultChecked className="w-4 h-4" />
                      <span className="text-sm">Individual</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>

              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Suburb</Label>
                  <Input
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Postcode</Label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price Level</Label>
                  <Input
                    value={formData.price_level}
                    onChange={(e) => setFormData({ ...formData, price_level: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Default Discount (%)</Label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Source of Business</Label>
                <Input
                  value={formData.source_of_business}
                  onChange={(e) => setFormData({ ...formData, source_of_business: e.target.value })}
                />
              </div>

              <div>
                <Label>Credit Limit</Label>
                <Input
                  type="number"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_account_payment"
                  checked={formData.enable_account_payment}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, enable_account_payment: checked as boolean })
                  }
                />
                <label htmlFor="enable_account_payment" className="text-sm">
                  Enable Account Payment
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_booking_reminder"
                  checked={formData.enable_booking_reminder}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, enable_booking_reminder: checked as boolean })
                  }
                />
                <label htmlFor="enable_booking_reminder" className="text-sm">
                  Enable Booking Reminder
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_service_reminder"
                  checked={formData.enable_service_reminder}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, enable_service_reminder: checked as boolean })
                  }
                />
                <label htmlFor="enable_service_reminder" className="text-sm">
                  Enable Service Reminder
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable_marketing_email"
                  checked={formData.enable_marketing_email}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, enable_marketing_email: checked as boolean })
                  }
                />
                <label htmlFor="enable_marketing_email" className="text-sm">
                  Enable Marketing Emails
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_communication_via_email"
                  checked={formData.send_communication_via_email}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, send_communication_via_email: checked as boolean })
                  }
                />
                <label htmlFor="send_communication_via_email" className="text-sm">
                  Send Communication via Email
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}