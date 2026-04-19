import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function ReminderSettings() {
  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Reminder Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Service Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Automatic Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send service reminders to customers automatically
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Reminder Frequency (days before service due)</Label>
              <Input type="number" defaultValue="30" />
            </div>

            <div className="space-y-2">
              <Label>Reminder Message Template</Label>
              <Textarea
                rows={4}
                defaultValue="Hi {customer_name}, your {vehicle_make} {vehicle_model} is due for service on {service_date}. Book now!"
              />
            </div>

            <div className="space-y-2">
              <Label>Send Method</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="method" value="email" defaultChecked />
                  Email
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="method" value="sms" />
                  SMS
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="method" value="both" />
                  Both
                </label>
              </div>
            </div>

            <Button>Save Reminder Settings</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}