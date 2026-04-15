import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Car, 
  FileText, 
  DollarSign, 
  Calendar,
  Building2,
  AlertCircle,
  Edit,
  Save,
  X,
  Trash2,
  Merge
} from "lucide-react";
import { customerService } from "@/services/customerService";
import { vehicleService } from "@/services/vehicleService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    is_company: false,
    mobile: "",
    phone: "",
    email: "",
    postal_address: "",
    postal_city: "",
    postal_postal_code: "",
    physical_address: "",
    physical_city: "",
    physical_postal_code: "",
    marketing_consent: false,
    notes: "",
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const custData = await customerService.getCustomer(id as string);
      setCustomer(custData);
      setFormData({
        name: custData.name || "",
        is_company: custData.is_company || false,
        mobile: custData.mobile || "",
        phone: custData.phone || "",
        email: custData.email || "",
        postal_address: custData.postal_address || "",
        postal_city: custData.postal_city || "",
        postal_postal_code: custData.postal_postal_code || "",
        physical_address: custData.physical_address || "",
        physical_city: custData.physical_city || "",
        physical_postal_code: custData.physical_postal_code || "",
        marketing_consent: custData.marketing_consent || false,
        notes: custData.notes || "",
      });

      const vehData = await vehicleService.getCustomerVehicles(id as string);
      setVehicles(vehData);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    await customerService.updateCustomer(id as string, formData);
    setEditing(false);
    loadData();
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: customer.name || "",
      is_company: customer.is_company || false,
      mobile: customer.mobile || "",
      phone: customer.phone || "",
      email: customer.email || "",
      postal_address: customer.postal_address || "",
      postal_city: customer.postal_city || "",
      postal_postal_code: customer.postal_postal_code || "",
      physical_address: customer.physical_address || "",
      physical_city: customer.physical_city || "",
      physical_postal_code: customer.physical_postal_code || "",
      marketing_consent: customer.marketing_consent || false,
      notes: customer.notes || "",
    });
  };

  if (loading || !customer) {
    return <LoadingSpinner />;
  }

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/customers")}>
              ← Back
            </Button>
            <div>
              <h1 className="font-heading text-3xl font-bold">{customer.name}</h1>
              <p className="text-muted-foreground mt-1">
                Customer #{customer.customer_number || customer.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button variant="outline" size="sm">
                  <Merge className="h-4 w-4 mr-2" />
                  Merge Customer
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Customer Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                  <p className="text-xs text-muted-foreground">Vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                  <p className="text-xs text-muted-foreground">Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$0.00</p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    {editing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{customer.name || "—"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    {editing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.is_company}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_company: checked })}
                        />
                        <Label>Business/Company</Label>
                      </div>
                    ) : (
                      <Badge variant={customer.is_company ? "default" : "outline"}>
                        {customer.is_company ? "Business" : "Individual"}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Mobile</Label>
                    {editing ? (
                      <Input
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{customer.mobile || "—"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {editing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{customer.phone || "—"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{customer.email || "—"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Marketing Consent</Label>
                    {editing ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.marketing_consent}
                          onCheckedChange={(checked) => setFormData({ ...formData, marketing_consent: checked })}
                        />
                        <Label>Consent given</Label>
                      </div>
                    ) : (
                      <Badge variant={customer.marketing_consent ? "outline" : "secondary"}>
                        {customer.marketing_consent ? "Yes" : "No"}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  {editing ? (
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{customer.notes || "—"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Postal Address</h4>
                  {editing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Address"
                        value={formData.postal_address}
                        onChange={(e) => setFormData({ ...formData, postal_address: e.target.value })}
                      />
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input
                          placeholder="City"
                          value={formData.postal_city}
                          onChange={(e) => setFormData({ ...formData, postal_city: e.target.value })}
                        />
                        <Input
                          placeholder="Postal Code"
                          value={formData.postal_postal_code}
                          onChange={(e) => setFormData({ ...formData, postal_postal_code: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{customer.postal_address || "—"}</p>
                        {customer.postal_city && (
                          <p className="text-muted-foreground">
                            {customer.postal_city} {customer.postal_postal_code}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Physical Address</h4>
                  {editing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Address"
                        value={formData.physical_address}
                        onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                      />
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input
                          placeholder="City"
                          value={formData.physical_city}
                          onChange={(e) => setFormData({ ...formData, physical_city: e.target.value })}
                        />
                        <Input
                          placeholder="Postal Code"
                          value={formData.physical_postal_code}
                          onChange={(e) => setFormData({ ...formData, physical_postal_code: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{customer.physical_address || "—"}</p>
                        {customer.physical_city && (
                          <p className="text-muted-foreground">
                            {customer.physical_city} {customer.physical_postal_code}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vehicles</CardTitle>
                    <CardDescription>Customer vehicles</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => router.push("/vehicles/new?customer=" + id)}>
                    <Car className="h-4 w-4 mr-2" />
                    Add Vehicle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <EmptyState
                    icon={Car}
                    title="No vehicles"
                    description="Add a vehicle to get started"
                  />
                ) : (
                  <div className="space-y-3">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold">{vehicle.registration_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </p>
                            {vehicle.vin && (
                              <p className="text-xs text-muted-foreground">VIN: {vehicle.vin}</p>
                            )}
                          </div>
                          {vehicle.wof_expiry && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">WOF Expiry</p>
                              <p className="text-sm font-medium">
                                {new Date(vehicle.wof_expiry).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
                <CardDescription>Service and repair jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={FileText}
                  title="No jobs yet"
                  description="Job history will appear here"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>Billing and payment records</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={DollarSign}
                  title="No invoices"
                  description="Invoice history will appear here"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reminders</CardTitle>
                <CardDescription>Service and WOF reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Calendar}
                  title="No reminders"
                  description="Reminders will appear here"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}