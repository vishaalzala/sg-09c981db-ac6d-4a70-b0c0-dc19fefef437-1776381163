import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

export default function ServiceSchedules() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    method: "email_then_sms",
    subject: "Your ${vehicle_title} service is due",
    message: "Dear ${customer_name},\n\nA friendly reminder that your ${vehicle_title} is due for service on ${next_service_date} to book your vehicle: please call us on 09 420 7385. Thanks. Bridgestone Helensville."
  });

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadVehicles(c.id);
      }
    });
  }, []);

  const loadVehicles = async (cId: string) => {
    const { data } = await supabase
      .from("vehicles")
      .select("*, customer:customers(name, mobile, email)")
      .eq("company_id", cId)
      .order("service_due_date", { ascending: true, nullsFirst: false });
    setVehicles(data || []);
  };

  const handleSendReminder = async () => {
    if (selected.length === 0) {
      toast({ title: "Error", description: "Please select vehicles", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: `Reminders sent to ${selected.length} customer(s)` });
    setShowReminderDialog(false);
    setSelected([]);
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Service Schedules</h1>
          <Button onClick={() => setShowReminderDialog(true)} disabled={selected.length === 0}>
            Send Reminder ({selected.length})
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      checked={selected.length === vehicles.length && vehicles.length > 0}
                      onChange={(e) => setSelected(e.target.checked ? vehicles.map(v => v.id) : [])}
                    />
                  </TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>VEHICLE</TableHead>
                  <TableHead>OWNER</TableHead>
                  <TableHead>LAST JOB</TableHead>
                  <TableHead>NEXT SERVICE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selected.includes(vehicle.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelected([...selected, vehicle.id]);
                          } else {
                            setSelected(selected.filter(id => id !== vehicle.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{vehicle.service_due_date ? "Sent 1 days ago" : "Not sent"}</TableCell>
                    <TableCell>{vehicle.registration_number} - {vehicle.make} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.customer?.name}</TableCell>
                    <TableCell>{vehicle.last_service_date ? new Date(vehicle.last_service_date).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{vehicle.service_due_date ? new Date(vehicle.service_due_date).toLocaleDateString() : "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Send By</Label>
              <select 
                className="w-full border rounded px-3 py-2 mt-1"
                value={reminderForm.method}
                onChange={(e) => setReminderForm({ ...reminderForm, method: e.target.value })}
              >
                <option value="email_then_sms">Try email first then sms</option>
                <option value="sms_then_email">Try sms first then email</option>
                <option value="email_only">Send by email only</option>
                <option value="sms_only">Send by sms only</option>
                <option value="both">Send both email and sms</option>
                <option value="postal">Generate postal mails</option>
              </select>
            </div>

            <div>
              <Label>Subject</Label>
              <input 
                className="w-full border rounded px-3 py-2 mt-1"
                value={reminderForm.subject}
                onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea 
                rows={6}
                value={reminderForm.message}
                onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Variables: ${`{customer_name}`}, ${`{vehicle_title}`}, ${`{next_service_date}`}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>Cancel</Button>
              <Button onClick={handleSendReminder}>Send Reminder</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}