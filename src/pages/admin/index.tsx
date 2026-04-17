import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Building2, Users, DollarSign, TrendingUp, 
  Shield, Settings, BarChart3, Activity,
  Plus, Edit, Eye, AlertTriangle
} from "lucide-react";
import { companyService } from "@/services/companyService";
import { billingService } from "@/services/billingService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { SeedDemoUsersButton } from "@/components/admin/SeedDemoUsersButton";

export default function SuperAdminPanel() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const [revenue, setRevenue] = useState({ monthly: 0, annual: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminChecking, setAdminChecking] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          if (!cancelled) setAdminChecking(false);
          return;
        }

        const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
        if (error) {
          console.error("Admin role check error:", error);
          return;
        }

        if (!profile || profile.role !== "super_admin") {
          toast({ title: "Access denied", description: "You do not have access to the Super Admin panel.", variant: "destructive" });
          router.replace("/dashboard");
          return;
        }
      } finally {
        if (!cancelled) setAdminChecking(false);
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [router, toast]);

  const loadData = async () => {
    setLoading(true);
    
    // Load companies, plans, addons (simplified)
    setCompanies([
      { id: "1", name: "Auckland AutoTech", plan: "Pro", users: 12, mrr: 299, status: "active" },
      { id: "2", name: "Wellington Motors", plan: "Growth", users: 8, mrr: 149, status: "active" },
      { id: "3", name: "Christchurch Garage", plan: "Starter", users: 3, mrr: 49, status: "trial" },
    ]);

    setPlans([
      { id: "starter", name: "Starter", price: 49, interval: "month", companies: 15 },
      { id: "growth", name: "Growth", price: 149, interval: "month", companies: 42 },
      { id: "pro", name: "Pro", price: 299, interval: "month", companies: 28 },
    ]);

    const catalog = await billingService.getAddonCatalog();
    setAddons(catalog);

    setRevenue({ monthly: 12450, annual: 149400 });
    
    setLoading(false);
  };

  if (adminChecking || loading) {
    return <LoadingSpinner />;
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = companies.reduce((sum, c) => sum + c.mrr, 0);
  const totalUsers = companies.reduce((sum, c) => sum + c.users, 0);
  const activeCompanies = companies.filter(c => c.status === "active").length;

  return (
    <ProtectedRoute>
      <AdminLayout userName="Super Admin">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Super Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">Manage all companies, pricing, and platform usage</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{companies.length}</p>
                  <Building2 className="h-8 w-8 text-primary opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{activeCompanies} active subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">${totalMRR.toLocaleString()}</p>
                  <DollarSign className="h-8 w-8 text-success opacity-50" />
                </div>
                <p className="text-xs text-success mt-2">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">{totalUsers}</p>
                  <Users className="h-8 w-8 text-accent opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Across all companies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Add-on Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold">$2,450</p>
                  <TrendingUp className="h-8 w-8 text-warning opacity-50" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">WOF + CARJAM usage</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="companies" className="space-y-6">
            <TabsList>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
              <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            </TabsList>

            {/* Companies Tab */}
            <TabsContent value="companies">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>Company Management</CardTitle>
                      <CardDescription>Manage workshop accounts and subscriptions</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <SeedDemoUsersButton />
                      <CreateUserDialog triggerLabel="Create user" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>MRR</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{company.plan}</Badge>
                          </TableCell>
                          <TableCell>{company.users}</TableCell>
                          <TableCell>${company.mrr}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              company.status === "active" && "bg-success",
                              company.status === "trial" && "bg-warning"
                            )}>
                              {company.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans">
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.companies} companies subscribed</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold">${plan.price}</p>
                        <p className="text-sm text-muted-foreground">per {plan.interval}</p>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Pricing
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Features
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Add-ons Tab */}
            <TabsContent value="addons">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Add-on Catalog</CardTitle>
                      <CardDescription>Manage paid add-ons and pricing</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Add-on
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{addon.name}</p>
                          <p className="text-sm text-muted-foreground">{addon.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">${addon.price}</p>
                            <p className="text-xs text-muted-foreground">{addon.billing_interval}</p>
                          </div>
                          <Badge className={addon.is_active ? "bg-success" : "bg-muted"}>
                            {addon.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Usage Analytics Tab */}
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage Analytics</CardTitle>
                  <CardDescription>Track feature adoption and usage-based billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">CARJAM Lookups</p>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">1,247</p>
                          <p className="text-xs text-success">+18% vs last month</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">WOF Inspections</p>
                          <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">843</p>
                          <p className="text-xs text-success">+12% vs last month</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Marketing Campaigns</p>
                          <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">42</p>
                          <p className="text-xs text-muted-foreground">15 companies</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-4">Top Add-on Revenue</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">WOF Compliance</span>
                            <span className="font-medium">$1,890</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">CARJAM Usage</span>
                            <span className="font-medium">$560</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Marketing</span>
                            <span className="font-medium">$420</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>System Audit Logs</CardTitle>
                  <CardDescription>Track all admin actions and system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">Audit log viewer would go here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}