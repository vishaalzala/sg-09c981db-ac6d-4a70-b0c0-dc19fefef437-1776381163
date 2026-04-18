import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getDashboardStats, 
  getAllCompanies, 
  getAllUsers, 
  getAllPlans,
  getAllAddons,
  getAuditLogs,
  createCompany,
  assignPlanToCompany,
  assignAddonToCompany,
  removeAddonFromCompany,
  type DashboardStats 
} from "@/services/adminService";
import { 
  Building2, 
  Users, 
  Clock, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Plus,
  Settings,
  Shield,
  FileText
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<Tables<"subscription_plans">[]>([]);
  const [addons, setAddons] = useState<Tables<"addon_catalog">[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (activeTab === "dashboard") {
        const dashStats = await getDashboardStats();
        setStats(dashStats);
      } else if (activeTab === "companies") {
        const companiesData = await getAllCompanies();
        setCompanies(companiesData || []);
      } else if (activeTab === "users") {
        const usersData = await getAllUsers();
        setUsers(usersData || []);
      } else if (activeTab === "plans") {
        const plansData = await getAllPlans();
        setPlans(plansData || []);
      } else if (activeTab === "addons") {
        const addonsData = await getAllAddons();
        setAddons(addonsData || []);
      } else if (activeTab === "audit") {
        const logsData = await getAuditLogs(50);
        setAuditLogs(logsData || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Administration</h1>
            <p className="text-muted-foreground">Manage companies, users, plans, and platform settings</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Shield className="w-3 h-3 mr-1" />
            Super Admin
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">Loading dashboard...</div>
            ) : stats ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                      <p className="text-xs text-muted-foreground mt-1">Active companies</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground mt-1">Platform users</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeTrials}</div>
                      <p className="text-xs text-muted-foreground mt-1">14-day free trials</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.paidSubscriptions}</div>
                      <p className="text-xs text-muted-foreground mt-1">Active subscriptions</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground mt-1">NZD per month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.trialConversionRate.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Trial to paid</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Companies</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading companies...</div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {companies.map((company) => (
                      <div key={company.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            <p className="text-sm text-muted-foreground">{company.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={company.subscription?.status === "active" ? "default" : "secondary"}>
                              {company.subscription?.status || "No subscription"}
                            </Badge>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Users</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading users...</div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{user.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">{user.company?.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {user.role?.display_name || "No role"}
                            </Badge>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Subscription Plans</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading plans...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          ${plan.price_monthly}
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </div>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add-ons Tab */}
          <TabsContent value="addons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add-ons</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Add-on
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading add-ons...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {addons.map((addon) => (
                  <Card key={addon.id}>
                    <CardHeader>
                      <CardTitle>{addon.display_name || addon.name}</CardTitle>
                      <CardDescription>{addon.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          ${addon.price_monthly}
                          <span className="text-sm font-normal text-muted-foreground">/{addon.addon_type === 'usage' ? addon.usage_unit : 'month'}</span>
                        </div>
                        <Badge variant={addon.is_active ? "default" : "secondary"}>
                          {addon.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <h2 className="text-xl font-semibold">Audit Logs</h2>

            {loading ? (
              <div className="text-center py-12">Loading audit logs...</div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {auditLogs.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No audit logs found
                      </div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-muted/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{log.action}</span>
                                <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                By {log.user?.full_name || "System"} • {log.company?.name || "Platform"}
                              </p>
                              {log.metadata && (
                                <pre className="text-xs mt-2 p-2 bg-muted rounded">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}