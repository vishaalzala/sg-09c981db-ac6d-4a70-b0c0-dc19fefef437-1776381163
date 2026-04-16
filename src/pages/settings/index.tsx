import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Building2, Users, Bell, CreditCard, 
  Shield, Database, Palette, Globe
} from "lucide-react";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { billingService } from "@/services/billingService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const [companyId, setCompanyId] = useState("");
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addons, setAddons] = useState<any[]>([]);
  const [enabledAddons, setEnabledAddons] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadAddons();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      setCompanyData(company);
    }
    setLoading(false);
  };

  const loadAddons = async () => {
    try {
      const catalog = await billingService.getAddonCatalog();
      setAddons(catalog);
      
      const company = await companyService.getCurrentCompany();
      if (company) {
        const active = await billingService.getCompanyAddons(company.id);
        setEnabledAddons(active.map(a => a.addon_id));
      }
    } catch (error) {
      console.error("Error loading addons:", error);
    }
  };

  const toggleAddon = async (addonId: string, enabled: boolean) => {
    try {
      if (enabled) {
        const { data: { user } } = await supabase.auth.getUser();
        await billingService.enableAddon(companyId, addonId, user?.id || "");
        setEnabledAddons(prev => [...prev, addonId]);
        toast({ title: "Add-on Enabled", description: "The feature is now active." });
      } else {
        // Find the record id to disable
        const active = await billingService.getCompanyAddons(companyId);
        const record = active.find(a => a.addon_id === addonId);
        if (record) {
          await billingService.disableAddon(record.id);
          setEnabledAddons(prev => prev.filter(id => id !== addonId));
          toast({ title: "Add-on Disabled" });
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AppLayout companyId={companyId} companyName={companyData?.name || "Workshop"} userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your workshop settings and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Update your workshop details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" defaultValue={companyData?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abn">ABN / NZBN</Label>
                    <Input id="abn" placeholder="Business number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+64 21 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="info@workshop.co.nz" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input id="address" placeholder="Street address" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Auckland" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input id="region" placeholder="Auckland" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input id="postal" placeholder="1010" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button>Save Company Details</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Branch Locations</CardTitle>
                <CardDescription>Manage multiple workshop locations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Branch
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage team members and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure email and SMS notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Booking Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify when customers book online</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WOF Due Reminders</p>
                    <p className="text-sm text-muted-foreground">Auto-send reminders to customers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Received</p>
                    <p className="text-sm text-muted-foreground">Notify when invoices are paid</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Notify when inventory is low</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>Manage your plan and payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => window.location.href = "/billing"}>
                  View Billing Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Integrations
                </CardTitle>
                <CardDescription>Connect third-party services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">CARJAM Vehicle Data</p>
                    <p className="text-sm text-muted-foreground">NZ vehicle info lookup</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Xero Accounting</p>
                    <p className="text-sm text-muted-foreground">Sync invoices and payments</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Windcave Payments</p>
                    <p className="text-sm text-muted-foreground">Online payments</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  System Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>Pacific/Auckland (NZST)</option>
                    <option>Australia/Sydney (AEDT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option>NZD ($)</option>
                    <option>AUD ($)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}