import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <h1 className="font-heading text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="workshop">Workshop Details</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="data">Data Export/Import</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input placeholder="First name" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email address" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input placeholder="Phone number" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workshop">
            <Card>
              <CardHeader>
                <CardTitle>Workshop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Workshop Name</Label>
                  <Input placeholder="Workshop name" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea placeholder="Full address" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="Phone" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="Email" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your workshop staff and their permissions here.</p>
                <Button className="mt-4">Add Employee</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Connect external services and APIs.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Export Data</h3>
                  <Button>Download All Data (CSV)</Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Import Data</h3>
                  <Input type="file" />
                  <Button className="mt-2">Upload CSV</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}