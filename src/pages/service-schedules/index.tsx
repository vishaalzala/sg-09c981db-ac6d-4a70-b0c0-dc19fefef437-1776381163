import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ServiceSchedules() {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<any[]>([]);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendMethod, setSendMethod] = useState("email_then_sms");
  const [subject, setSubject] = useState("Your service is due");
  const [message, setMessage] = useState(`Dear customer_name,

A friendly reminder that your vehicle_title is due for service on next_service_date to book your vehicle: please call us on 09 420 7385. Thanks {workshop_name}.`);

  useEffect(() => {
    loadServiceReminders();
  }, []);

  const loadServiceReminders = async () => {
    // Mock data for demonstration
    const mockReminders = [
      {
        id: "1",
        status: "Sent 1 days ago",
        vehicle: "2015 Volkswagen Golf GTN277",
        owner: "Melvin James",
        last_job: "21/11/25",
        last_job_date: "10/04/26",
        next_service: "10/04/27"
      },
      {
        id: "2",
        status: "Sent 1 days ago",
        vehicle: "2019 Toyota Camry Hybrid GSX7109",
        owner: "John Standing",
        last_job: "19/10/25",
        last_job_date: "10/04/26",
        next_service: "10/04/27"
      },
      {
        id: "3",
        status: "Sent 1 days ago",
        vehicle: "2020 Subaru Forester XV2909",
        owner: "Melanie Burns",
        last_job: "16/10/25",
        last_job_date: "10/04/26",
        next_service: "10/04/27"
      }
    ];
    setReminders(mockReminders);
  };

  const handleSendReminders = async () => {
    toast({
      title: "Reminders Sent",
      description: `${selectedReminders.length} service reminders sent successfully`
    });
    setShowSendDialog(false);
    setSelectedReminders([]);
  };

  const toggleReminder = (id: string) => {
    setSelectedReminders(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedReminders.length === reminders.length) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(reminders.map(r => r.id));
    }
  };

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Service Schedules</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSendDialog(true)}
              disabled={selectedReminders.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedReminders.length} Selected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedReminders.length === reminders.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Reminder Status</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Job</TableHead>
                  <TableHead>Last Job Date</TableHead>
                  <TableHead>Next Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReminders.includes(reminder.id)}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                      />
                    </TableCell>
                    <TableCell>{reminder.status}</TableCell>
                    <TableCell>{reminder.vehicle}</TableCell>
                    <TableCell>{reminder.owner}</TableCell>
                    <TableCell>{reminder.last_job}</TableCell>
                    <TableCell>{reminder.last_job_date}</TableCell>
                    <TableCell>{reminder.next_service}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Send Reminder Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Send By</Label>
              <RadioGroup value={sendMethod} onValueChange={setSendMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email_then_sms" id="email_then_sms" />
                  <Label htmlFor="email_then_sms">Try email first then sms</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms_then_email" id="sms_then_email" />
                  <Label htmlFor="sms_then_email">Try sms first then email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email_only" id="email_only" />
                  <Label htmlFor="email_only">Send by email only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms_only" id="sms_only" />
                  <Label htmlFor="sms_only">Send by sms only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Send both email and sms</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="postal" id="postal" />
                  <Label htmlFor="postal">Generate postal mails</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Note: anything inside  will be replaced by real value
                Eg.  to become Honda Prelude
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSendReminders} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button onClick={() => setShowSendDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}