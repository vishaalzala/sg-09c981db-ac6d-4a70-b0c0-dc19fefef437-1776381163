import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Wrench, 
  FileText, 
  Receipt, 
  TrendingUp, 
  Users, 
  Car,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayBookings: 8,
    activeJobs: 12,
    pendingQuotes: 5,
    overdueInvoices: 2,
    revenue: 45000,
    customers: 324,
    vehicles: 489,
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    { title: "Today's Bookings", value: stats.todayBookings, icon: Calendar, color: "text-primary", href: "/bookings" },
    { title: "Active Jobs", value: stats.activeJobs, icon: Wrench, color: "text-accent", href: "/jobs" },
    { title: "Pending Quotes", value: stats.pendingQuotes, icon: FileText, color: "text-secondary", href: "/quotes" },
    { title: "Overdue Invoices", value: stats.overdueInvoices, icon: AlertCircle, color: "text-destructive", href: "/invoices" },
  ];

  const recentJobs = [
    { id: "1", orderNumber: "J-2024-001", customer: "John Smith", vehicle: "ABC123 - Toyota Corolla", status: "in_progress", mechanic: "Mike Johnson" },
    { id: "2", orderNumber: "J-2024-002", customer: "Sarah Wilson", vehicle: "XYZ789 - Honda Civic", status: "waiting_approval", mechanic: "David Lee" },
    { id: "3", orderNumber: "J-2024-003", customer: "Fleet Motors Ltd", vehicle: "DEF456 - Ford Ranger", status: "waiting_parts", mechanic: "Mike Johnson" },
    { id: "4", orderNumber: "J-2024-004", customer: "Emma Brown", vehicle: "GHI321 - Mazda 3", status: "ready_for_pickup", mechanic: "Sarah Chen" },
  ];

  const todayBookings = [
    { id: "1", time: "09:00", customer: "James Anderson", vehicle: "JKL654 - Nissan Navara", service: "Service + WOF", status: "confirmed" },
    { id: "2", time: "10:30", customer: "Lisa Taylor", vehicle: "MNO987 - Subaru Outback", service: "Brake Repair", status: "confirmed" },
    { id: "3", time: "13:00", customer: "David Martinez", vehicle: "PQR246 - Toyota Hilux", service: "Wheel Alignment", status: "pending" },
    { id: "4", time: "15:00", customer: "Sophie Johnson", vehicle: "STU135 - Volkswagen Golf", service: "Oil Change", status: "confirmed" },
  ];

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your workshop operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>December 2026</CardDescription>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-heading">${stats.revenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>+12% from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="bookings">Today's Bookings</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Jobs</CardTitle>
                <CardDescription>Jobs currently in progress or awaiting action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{job.orderNumber}</span>
                          <StatusBadge status={job.status} type="job" />
                        </div>
                        <p className="text-sm text-muted-foreground">{job.customer}</p>
                        <p className="text-sm">{job.vehicle}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Assigned to</p>
                        <p className="font-medium text-foreground">{job.mechanic}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => window.location.href = "/jobs"}>
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Bookings</CardTitle>
                <CardDescription>Scheduled appointments for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary font-semibold">
                        {booking.time}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{booking.customer}</span>
                          <StatusBadge status={booking.status} type="booking" />
                        </div>
                        <p className="text-sm text-muted-foreground">{booking.vehicle}</p>
                        <p className="text-sm">{booking.service}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => window.location.href = "/bookings"}>
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions across your workshop</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Job J-2024-005 completed</p>
                      <p className="text-xs text-muted-foreground">Mike Johnson • 10 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Quote Q-2024-032 sent to customer</p>
                      <p className="text-xs text-muted-foreground">Sarah Chen • 25 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent/10">
                      <Receipt className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Invoice I-2024-089 paid</p>
                      <p className="text-xs text-muted-foreground">System • 1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary/10">
                      <Users className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">New customer registered</p>
                      <p className="text-xs text-muted-foreground">Reception • 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}