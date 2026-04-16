import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Mail, MessageSquare, Clock } from "lucide-react";

export default function ReminderAutomation() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Settings Saved", description: "Reminder automation rules updated successfully." });
    }, 800);
  };

  const RuleRow = ({ title, type, defaultDays }: { title: string, type: string, defaultDays: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg mb-4 bg-card">
      <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-8">
        <div className="w-48">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{type} trigger</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input type="number" defaultValue={defaultDays} className="w-16 h-8 text-center" />
          <span className="text-sm text-muted-foreground">days before due</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch defaultChecked id={`${type}-sms`} /> 
            <Label htmlFor={`${type}-sms`} className="flex items-center gap-1 cursor-pointer"><MessageSquare className="h-4 w-4 text-blue-500" /> SMS</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch defaultChecked id={`${type}-email`} /> 
            <Label htmlFor={`${type}-email`} className="flex items-center gap-1 cursor-pointer"><Mail className="h-4 w-4 text-orange-500" /> Email</Label>
          </div>
        </div>
      </div>
      <div className="mt-4 sm:mt-0 pl-4 sm:border-l">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Active</span>
          <Switch defaultChecked className="data-[state=checked]:bg-green-500" />
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout companyId="current" companyName="AutoTech Workshop" userName="Admin">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Reminder Automation</h1>
            <p className="text-muted-foreground">Configure automated SMS and Email rules to reduce no-shows.</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="rules" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">Automation Rules</TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">Message Templates</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3">Send History</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trigger Rules</CardTitle>
                <CardDescription>Set up timing and channels for recurring automated reminders.</CardDescription>
              </CardHeader>
              <CardContent>
                <RuleRow title="WOF Expiry Warning" type="wof" defaultDays="14" />
                <RuleRow title="Service Due Date" type="service" defaultDays="30" />
                <RuleRow title="Rego Expiry Reminder" type="rego" defaultDays="7" />
                <RuleRow title="Wheel Alignment Follow-up" type="alignment" defaultDays="180" />
                <RuleRow title="Cambelt Replacement" type="cambelt" defaultDays="365" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS & Email Templates</CardTitle>
                <CardDescription>Available variables: {'{customer_name}'}, {'{vehicle_rego}'}, {'{vehicle_make}'}, {'{due_date}'}, {'{booking_link}'}, {'{workshop_name}'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" /> SMS Templates</h3>
                    
                    <div className="space-y-2">
                      <Label>WOF Due (SMS)</Label>
                      <Textarea 
                        className="min-h-[100px] resize-none"
                        defaultValue="Hi {customer_name}, the WOF for {vehicle_rego} is due on {due_date}. Book online here: {booking_link} - {workshop_name}" 
                      />
                      <p className="text-xs text-muted-foreground text-right">132 / 160 characters (1 SMS)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Service Due (SMS)</Label>
                      <Textarea 
                        className="min-h-[100px] resize-none"
                        defaultValue="Hi {customer_name}, {vehicle_rego} is due for its next service on {due_date}. Call us or book online: {booking_link}" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Mail className="h-5 w-5" /> Email Templates</h3>
                    
                    <div className="space-y-2">
                      <Label>WOF Due (Email Subject)</Label>
                      <Input defaultValue="WOF Reminder for your {vehicle_make} ({vehicle_rego})" />
                    </div>
                    <div className="space-y-2">
                      <Label>WOF Due (Email Body)</Label>
                      <Textarea 
                        className="min-h-[160px]"
                        defaultValue="Dear {customer_name},\n\nThis is a friendly reminder that the Warrant of Fitness (WOF) for your {vehicle_make} (Registration: {vehicle_rego}) is due to expire on {due_date}.\n\nPlease ensure you book in before this date to keep your vehicle road legal.\n\nYou can easily book your inspection online at: {booking_link}\n\nKind regards,\nThe Team at {workshop_name}" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Send History & Logs</CardTitle>
                <CardDescription>Track all automated communications sent to customers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <h3 className="font-medium text-lg">No history yet</h3>
                  <p className="text-muted-foreground">Automated logs will appear here once reminders are sent.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}