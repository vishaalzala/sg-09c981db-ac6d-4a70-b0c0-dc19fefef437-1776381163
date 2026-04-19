import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { companyService } from "@/services/companyService";

export default function Communications() {
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) setCompanyId(c.id);
    });
  }, []);

  const emailData = [
    { date: "16/04/26, 14:45 pm", sentTo: "info@thefreelancer.co.nz - North West Security - Mark Downs", status: "delivered" },
    { date: "16/04/26, 14:43 pm", sentTo: "info@thefreelancer.co.nz - North West Security - Mark Downs", status: "delivered" }
  ];

  const smsData = [
    { date: "16/04/26, 09:14 pm", sentTo: "+6421188826 - Shayla Nariman", status: "delivered" },
    { date: "16/04/26, 09:21 am", sentTo: "+6427289711 - Sammy Mohllala", status: "pending" }
  ];

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6">
        <h1 className="font-heading text-3xl font-bold mb-6">Communications</h1>

        <Tabs defaultValue="emails">
          <TabsList>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="emails">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DATE</TableHead>
                      <TableHead>SENT TO</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailData.map((email, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{email.date}</TableCell>
                        <TableCell>{email.sentTo}</TableCell>
                        <TableCell><span className="text-green-600">{email.status}</span></TableCell>
                        <TableCell><a href="#" className="text-blue-600 hover:underline">Resend</a></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DATE</TableHead>
                      <TableHead>SENT TO</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>BALANCE STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smsData.map((sms, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{sms.date}</TableCell>
                        <TableCell>{sms.sentTo}</TableCell>
                        <TableCell><span className={sms.status === "delivered" ? "text-green-600" : "text-yellow-600"}>{sms.status}</span></TableCell>
                        <TableCell>$0.50</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}