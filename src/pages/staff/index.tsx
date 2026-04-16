import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { timesheetService } from "@/services/timesheetService";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { 
  Users, 
  Clock, 
  Award, 
  Plus, 
  Search, 
  Calendar,
  TrendingUp,
  PlayCircle,
  StopCircle,
  FileText
} from "lucide-react";

export default function StaffManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("staff");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      
      // Load staff from users table
      const staffQuery = (supabase as any)
        .from("users")
        .select(`
          *,
          role:roles!users_role_id_fkey(name),
          branch:branches!users_branch_id_fkey(name)
        `)
        .eq("company_id", company.id)
        .order("full_name");
        
      const { data: staffData } = await staffQuery;
      
      setStaff(staffData || []);

      // Load today's timesheets
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const timesheetData = await timesheetService.getTimesheets(company.id, {
        dateFrom: todayStart.toISOString(),
        dateTo: new Date().toISOString()
      });
      
      setTimesheets(timesheetData || []);
    }
    setLoading(false);
  };

  const handleClockIn = async (userId: string) => {
    try {
      await timesheetService.clockIn(companyId, userId);
      toast({ title: "Clocked In", description: "Time tracking started successfully." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleClockOut = async (entryId: string, userId: string) => {
    try {
      await timesheetService.clockOut(entryId);
      toast({ title: "Clocked Out", description: "Time tracking stopped." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredStaff = staff.filter(s => 
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTimesheets = timesheets.filter(t => !t.clock_out_time);
  const completedToday = timesheets.filter(t => t.clock_out_time);

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Staff & Timesheets</h1>
            <p className="text-muted-foreground">Manage team members and track work hours</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold">{staff.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clocked In</p>
                  <p className="text-2xl font-bold text-success">{activeTimesheets.length}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold">{completedToday.length}</p>
                </div>
                <StopCircle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hours Today</p>
                  <p className="text-2xl font-bold">
                    {completedToday.reduce((sum, t) => {
                      if (t.clock_in_time && t.clock_out_time) {
                        const hours = (new Date(t.clock_out_time).getTime() - new Date(t.clock_in_time).getTime()) / (1000 * 60 * 60);
                        return sum + hours;
                      }
                      return sum;
                    }, 0).toFixed(1)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff Directory
            </TabsTrigger>
            <TabsTrigger value="timesheets">
              <Clock className="h-4 w-4 mr-2" />
              Timesheets
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="h-4 w-4 mr-2" />
              Certifications
            </TabsTrigger>
          </TabsList>

          {/* Staff Directory */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredStaff.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No staff members"
                    description="Add your first team member to get started"
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredStaff.map((member) => {
                      const role = Array.isArray(member.role) ? member.role[0] : member.role;
                      const branch = Array.isArray(member.branch) ? member.branch[0] : member.branch;
                      const activeTimesheet = activeTimesheets.find(t => t.user_id === member.id);

                      return (
                        <div
                          key={member.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{member.full_name}</span>
                                {activeTimesheet && (
                                  <Badge className="bg-success text-white">
                                    <PlayCircle className="h-3 w-3 mr-1" />
                                    Clocked In
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground">{member.email}</p>

                              <div className="flex items-center gap-4 text-sm">
                                {role && (
                                  <Badge variant="outline">{role.name}</Badge>
                                )}
                                {branch && (
                                  <span className="text-muted-foreground">Branch: {branch.name}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {activeTimesheet ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleClockOut(activeTimesheet.id, member.id)}
                                >
                                  <StopCircle className="h-4 w-4 mr-2" />
                                  Clock Out
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleClockIn(member.id)}
                                >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Clock In
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timesheets */}
          <TabsContent value="timesheets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {timesheets.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No time entries"
                    description="Clock in to start tracking time"
                  />
                ) : (
                  <div className="space-y-3">
                    {timesheets.map((entry) => {
                      const staffMember = staff.find(s => s.id === entry.user_id);
                      const duration = entry.clock_out_time
                        ? ((new Date(entry.clock_out_time).getTime() - new Date(entry.clock_in_time).getTime()) / (1000 * 60 * 60)).toFixed(2)
                        : "In Progress";

                      return (
                        <div
                          key={entry.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{staffMember?.full_name || "Unknown"}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>In: {new Date(entry.clock_in_time).toLocaleTimeString()}</span>
                                {entry.clock_out_time && (
                                  <span>Out: {new Date(entry.clock_out_time).toLocaleTimeString()}</span>
                                )}
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{duration}</p>
                              <p className="text-xs text-muted-foreground">hours</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    Track WOF inspector certifications, trade qualifications, and safety training here.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <EmptyState
                    icon={Award}
                    title="No certifications"
                    description="Add certifications to track expiry dates and compliance"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}