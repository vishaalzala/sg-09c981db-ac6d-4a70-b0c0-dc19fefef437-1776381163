import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Calendar, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";

export default function Staff() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTimesheetDialog, setShowTimesheetDialog] = useState(false);
  const [newStaff, setNewStaff] = useState({
    full_name: "",
    email: "",
    mobile: "",
    role: ""
  });
  const [newTimesheet, setNewTimesheet] = useState({
    staff_id: "",
    date: new Date().toISOString().split("T")[0],
    hours_worked: "",
    job_id: "",
    notes: ""
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadStaff(c.id);
        loadTimesheets(c.id);
      }
    });
  }, []);

  const loadStaff = async (cId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("company_id", cId)
      .order("full_name");
    setStaff(data || []);
  };

  const loadTimesheets = async (cId: string) => {
    const { data } = await supabase
      .from("timesheets")
      .select("*, users(full_name)")
      .eq("company_id", cId)
      .order("date", { ascending: false });
    setTimesheets(data || []);
  };

  const handleAddStaff = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from("users")
      .insert([{
        company_id: companyId,
        full_name: newStaff.full_name,
        email: newStaff.email,
        mobile: newStaff.mobile,
        role_id: newStaff.role
      }]);

    if (error) {
      toast({ title: "Error", description: "Failed to add staff member", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Staff member added successfully" });
    setShowAddDialog(false);
    setNewStaff({ full_name: "", email: "", mobile: "", role: "" });
    loadStaff(companyId);
  };

  const handleAddTimesheet = async () => {
    if (!companyId) return;

    const { error } = await supabase
      .from("timesheets")
      .insert([{
        company_id: companyId,
        user_id: newTimesheet.staff_id,
        date: newTimesheet.date,
        hours_worked: parseFloat(newTimesheet.hours_worked),
        job_id: newTimesheet.job_id || null,
        notes: newTimesheet.notes
      }]);

    if (error) {
      toast({ title: "Error", description: "Failed to add timesheet entry", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Timesheet entry added successfully" });
    setShowTimesheetDialog(false);
    setNewTimesheet({ staff_id: "", date: new Date().toISOString().split("T")[0], hours_worked: "", job_id: "", notes: "" });
    loadTimesheets(companyId);
  };

  const filteredStaff = staff.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Staff & Timesheets</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowTimesheetDialog(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Add Timesheet
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timesheets.reduce((sum, t) => sum + (t.hours_worked || 0), 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entries This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timesheets.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="staff">
          <TabsList>
            <TabsTrigger value="staff">Staff Members</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAME</TableHead>
                      <TableHead>EMAIL</TableHead>
                      <TableHead>PHONE</TableHead>
                      <TableHead>ROLE</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.mobile}</TableCell>
                        <TableCell>{member.role_id}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timesheets">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DATE</TableHead>
                      <TableHead>STAFF MEMBER</TableHead>
                      <TableHead>HOURS WORKED</TableHead>
                      <TableHead>JOB ID</TableHead>
                      <TableHead>NOTES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timesheets.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.users?.full_name}</TableCell>
                        <TableCell>{entry.hours_worked} hrs</TableCell>
                        <TableCell>{entry.job_id || "N/A"}</TableCell>
                        <TableCell>{entry.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newStaff.full_name}
                onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newStaff.mobile}
                onChange={(e) => setNewStaff({ ...newStaff, mobile: e.target.value })}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddStaff}>Add Staff</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimesheetDialog} onOpenChange={setShowTimesheetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timesheet Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Staff Member</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={newTimesheet.staff_id}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, staff_id: e.target.value })}
              >
                <option value="">Select staff member</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newTimesheet.date}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Hours Worked</Label>
              <Input
                type="number"
                step="0.5"
                value={newTimesheet.hours_worked}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, hours_worked: e.target.value })}
              />
            </div>
            <div>
              <Label>Job ID (optional)</Label>
              <Input
                value={newTimesheet.job_id}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, job_id: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newTimesheet.notes}
                onChange={(e) => setNewTimesheet({ ...newTimesheet, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTimesheetDialog(false)}>Cancel</Button>
              <Button onClick={handleAddTimesheet}>Add Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}