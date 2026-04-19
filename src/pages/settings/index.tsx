import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [companyName, setCompanyName] = useState("Bridgestone Helensville");
  const [email, setEmail] = useState("bridgestone.helensville@gmail.com");
  const [phone, setPhone] = useState("021176643");
  const [address, setAddress] = useState("21 Mill Rd, Helensville, Auckland 0800");

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Settings</h1>

        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="workshop">Workshop Details</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="chart">Chart of Accounts</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="data">Data Export/Import</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2-Step Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline">Enable 2-Step Authentication</Button>
                </div>

                <Separator className="my-6" />

                <div className="flex gap-2">
                  <Button>Change Password</Button>
                  <Button variant="outline">Update</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workshop">
            <Card>
              <CardHeader>
                <CardTitle>Workshop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workshop Name</Label>
                  <Input placeholder="Enter workshop name" />
                </div>
                <div className="space-y-2">
                  <Label>Workshop Email</Label>
                  <Input type="email" placeholder="workshop@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Workshop Phone</Label>
                  <Input placeholder="+64 9 420 7385" />
                </div>
                <div className="space-y-2">
                  <Label>Workshop Address</Label>
                  <Textarea rows={3} placeholder="Full workshop address" />
                </div>
                <div className="space-y-2">
                  <Label>Business Number</Label>
                  <Input placeholder="GST/ABN Number" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Employees</CardTitle>
                  <Button>Add Employee</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage workshop employees and their access levels
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card>
              <CardHeader>
                <CardTitle>Chart of Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure accounting categories and tax settings
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-semibold">Xero</h4>
                    <p className="text-sm text-muted-foreground">Accounting integration</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-semibold">CARJAM</h4>
                    <p className="text-sm text-muted-foreground">Vehicle information lookup</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-semibold">Payment Gateway</h4>
                    <p className="text-sm text-muted-foreground">Online payments</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Export / Import</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Export your workshop data as CSV or Excel files
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">Export Customers</Button>
                    <Button variant="outline">Export Vehicles</Button>
                    <Button variant="outline">Export Invoices</Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <h4 className="font-semibold">Import Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Import data from CSV files
                  </p>
                  <Input type="file" accept=".csv,.xlsx" />
                  <Button>Upload & Import</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}