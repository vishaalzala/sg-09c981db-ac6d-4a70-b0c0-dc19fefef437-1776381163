import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WebsiteSettings() {
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [companyName, setCompanyName] = useState("Bridgestone Helensville");
  const [bookingUrl, setBookingUrl] = useState("https://www.mechanicsdesk.com.au/online-booking/1234567890");

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Website & Online Booking</h1>

        <Tabs defaultValue="booking">
          <TabsList>
            <TabsTrigger value="booking">Online Booking</TabsTrigger>
            <TabsTrigger value="design">Website Design</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <Card>
              <CardHeader>
                <CardTitle>Online Booking Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Online Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to make bookings via your website
                    </p>
                  </div>
                  <Switch checked={bookingEnabled} onCheckedChange={setBookingEnabled} />
                </div>

                <div className="space-y-2">
                  <Label>Booking Page URL</Label>
                  <Input value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} />
                  <p className="text-sm text-muted-foreground">
                    Share this link with your customers for online bookings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Booking Form Options</Label>
                  <div className="space-y-3 border rounded p-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Require Customer Name</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Require Email Address</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Require Phone Number</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Show Address Field</Label>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Booking Confirmation Email</Label>
                  <Textarea
                    rows={5}
                    placeholder="Enter email template for booking confirmations..."
                    defaultValue="Thank you for booking with us. We'll see you on [date] at [time]."
                  />
                </div>

                <Button>Save Booking Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle>Website Design</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <Input type="file" accept="image/*" />
                </div>

                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input type="color" defaultValue="#1e40af" />
                </div>

                <div className="space-y-2">
                  <Label>Hero Image</Label>
                  <Input type="file" accept="image/*" />
                </div>

                <div className="space-y-2">
                  <Label>About Us Text</Label>
                  <Textarea rows={4} placeholder="Tell customers about your business..." />
                </div>

                <Button>Save Design Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input placeholder="e.g., Best Auto Repair in Auckland" />
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea rows={3} placeholder="Brief description for search engines..." />
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input placeholder="auto repair, car service, mechanic..." />
                </div>

                <Button>Save SEO Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}