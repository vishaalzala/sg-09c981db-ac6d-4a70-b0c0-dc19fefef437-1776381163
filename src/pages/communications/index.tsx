import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Communications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [emails, setEmails] = useState<any[]>([]);
  const [sms, setSms] = useState<any[]>([]);

  useEffect(() => {
    loadCommunications();
  }, []);

  const loadCommunications = () => {
    // Mock data
    const mockEmails = [
      { id: 1, date: "15/04/26, 04:29 pm", sentTo: "info@mechanicscentre.co.nz\nNorth West Security - Mark Dennis", sender: null, status: "delivered" },
      { id: 2, date: "15/04/26, 04:29 pm", sentTo: "info@mechanicscentre.co.nz\nNorth West Security - Mark Dennis", sender: null, status: "delivered" },
      { id: 3, date: "15/04/26, 12:13 pm", sentTo: "hello@gmail.com\nShelly Jones", sender: null, status: "delivered" }
    ];

    const mockSms = [
      { id: 1, date: "15/04/26, 08:11 pm", sentTo: "+6421167933\nStephan Jaramillo", sender: null, status: "delivered", relatedStatus: null },
      { id: 2, date: "15/04/26, 08:11 am", sentTo: "+6421193929\nDamian Savage", sender: null, status: "delivered", relatedStatus: null },
      { id: 3, date: "15/04/26, 08:11 am", sentTo: "+6421198821\nThomas Langlsuy", sender: null, status: "pending", relatedStatus: null }
    ];

    setEmails(mockEmails);
    setSms(mockSms);
  };

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Emails & SMS</h1>

        <Tabs defaultValue="emails">
          <TabsList>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email History</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DATE</TableHead>
                      <TableHead>SENT TO</TableHead>
                      <TableHead>SENDER</TableHead>
                      <TableHead>RELATED STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>{email.date}</TableCell>
                        <TableCell className="whitespace-pre-line">{email.sentTo}</TableCell>
                        <TableCell>{email.sender || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {email.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SMS History</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DATE</TableHead>
                      <TableHead>SENT TO</TableHead>
                      <TableHead>SENDER</TableHead>
                      <TableHead>RELATED STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sms.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>{message.date}</TableCell>
                        <TableCell className="whitespace-pre-line">{message.sentTo}</TableCell>
                        <TableCell>{message.sender || "-"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={message.status === "delivered" 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {message.status}
                          </Badge>
                        </TableCell>
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