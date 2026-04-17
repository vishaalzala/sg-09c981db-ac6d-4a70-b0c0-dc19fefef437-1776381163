import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Briefcase, FileText, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "@/components/PermissionGate";

export default function Dashboard() {
  const { toast } = useToast();
  const { role, can, loading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    activeJobs: 0,
    pendingQuotes: 0,
    unpaidInvoices: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: user } = await supabase.from("users").select("company_id").eq("id", auth.user.id).maybeSingle();

      if (!user?.company_id) {
        toast({ title: "Error", description: "No company context found", variant: "destructive" });
        return;
      }

      const companyId = user.company_id;

      // Get counts based on permissions
      const [customersResult, vehiclesResult, jobsResult, quotesResult, invoicesResult, revenueResult] = await Promise.all([
        can("customers:view")
          ? supabase.from("customers").select("id", { count: "exact", head: true }).eq("company_id", companyId).is("deleted_at", null)
          : { count: 0 },
        can("vehicles:view")
          ? supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("company_id", companyId).is("deleted_at", null)
          : { count: 0 },
        can("jobs:view")
          ? supabase
              .from("jobs")
              .select("id", { count: "exact", head: true })
              .eq("company_id", companyId)
              .in("status", ["booked", "in_progress", "waiting_approval", "waiting_parts"])
          : { count: 0 },
        can("quotes:view")
          ? supabase.from("quotes").select("id", { count: "exact", head: true }).eq("company_id", companyId).in("status", ["draft", "sent"])
          : { count: 0 },
        can("invoices:view")
          ? supabase
              .from("invoices")
              .select("id", { count: "exact", head: true })
              .eq("company_id", companyId)
              .in("status", ["draft", "sent", "overdue", "partially_paid"])
          : { count: 0 },
        can("invoices:view")
          ? supabase
              .from("invoices")
              .select("total_amount")
              .eq("company_id", companyId)
              .eq("status", "paid")
              .gte("invoice_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          : { data: [] },
      ]);

      const revenue = (revenueResult.data ?? []).reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);

      setStats({
        customers: customersResult.count ?? 0,
        vehicles: vehiclesResult.count ?? 0,
        activeJobs: jobsResult.count ?? 0,
        pendingQuotes: quotesResult.count ?? 0,
        unpaidInvoices: invoicesResult.count ?? 0,
        monthlyRevenue: revenue,
      });
    } catch (error: any) {
      console.error("Dashboard stats error:", error);
      toast({ title: "Error", description: "Failed to load dashboard stats", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (loading || permissionsLoading) {
    return (
      <ProtectedRoute requireWorkshop>
        <AppLayout>
          <div className="flex items-center justify-center min-h-screen">
            <p>Loading dashboard...</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireWorkshop>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your workshop overview.</p>
            {role && (
              <p className="text-sm text-muted-foreground mt-1">
                Role: <span className="font-semibold capitalize">{role.replace(/_/g, " ")}</span>
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PermissionGate permissions="customers:view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.customers}</div>
                  <p className="text-xs text-muted-foreground">Active customer accounts</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permissions="vehicles:view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.vehicles}</div>
                  <p className="text-xs text-muted-foreground">Vehicles in system</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permissions="jobs:view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeJobs}</div>
                  <p className="text-xs text-muted-foreground">In progress or waiting</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permissions="quotes:view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
                  <p className="text-xs text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permissions="invoices:view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unpaidInvoices}</div>
                  <p className="text-xs text-muted-foreground">Outstanding payments</p>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate permissions={["invoices:view", "reports:view_financial"]} requireAll>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">This month's paid invoices</p>
                </CardContent>
              </Card>
            </PermissionGate>
          </div>

          <PermissionGate permissions="jobs:view">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent jobs and quotes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Activity feed coming soon...</p>
              </CardContent>
            </Card>
          </PermissionGate>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}