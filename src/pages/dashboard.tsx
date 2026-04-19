import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { TrialBanner } from "@/components/TrialBanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Car, 
  Wrench, 
  FileText, 
  DollarSign, 
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    activeJobs: 0,
    pendingQuotes: 0,
    unpaidInvoices: 0,
    todayBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error loading user data:", userError);
        setError("Failed to load user data. Please try logging in again.");
        setLoading(false);
        return;
      }

      if (!userData?.company_id) {
        console.error("No company context found for user:", user.id);
        setError("No company context found. Please contact support.");
        setLoading(false);
        return;
      }

      setCompanyId(userData.company_id);

      // Load stats
      const [customers, vehicles, jobs, quotes, invoices, bookings] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("company_id", userData.company_id),
        supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("company_id", userData.company_id),
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("company_id", userData.company_id).in("status", ["in_progress", "booked"]),
        supabase.from("quotes").select("*", { count: "exact", head: true }).eq("company_id", userData.company_id).eq("status", "draft"),
        supabase.from("invoices").select("*", { count: "exact", head: true }).eq("company_id", userData.company_id).eq("status", "sent"),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("company_id", userData.company_id).gte("start_time", new Date().toISOString().split("T")[0])
      ]);

      setStats({
        customers: customers.count || 0,
        vehicles: vehicles.count || 0,
        activeJobs: jobs.count || 0,
        pendingQuotes: quotes.count || 0,
        unpaidInvoices: invoices.count || 0,
        todayBookings: bookings.count || 0
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/login")} variant="outline">
                Back to Login
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout companyId={companyId || ""}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your workshop</p>
        </div>

        <TrialBanner />

        {loading ? (
          <div className="text-center py-12">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.customers}</div>
                  <p className="text-xs text-muted-foreground">Active customer accounts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.vehicles}</div>
                  <p className="text-xs text-muted-foreground">In your database</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeJobs}</div>
                  <p className="text-xs text-muted-foreground">In progress or booked</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unpaidInvoices}</div>
                  <p className="text-xs text-muted-foreground">Outstanding payments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayBookings}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/customers">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Add New Customer
                    </Button>
                  </Link>
                  <Link href="/bookings">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Create Booking
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline" className="w-full justify-start">
                      <Wrench className="mr-2 h-4 w-4" />
                      Start New Job
                    </Button>
                  </Link>
                  <Link href="/quotes">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Quote
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}