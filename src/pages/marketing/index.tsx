import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, MessageSquare, BarChart } from "lucide-react";

export default function MarketingCampaigns() {
  const mockCampaigns = [
    { id: 1, name: "Winter Tyre Special", type: "Email", status: "Active", sent: 450, opened: 210, converted: 15 },
    { id: 2, name: "WOF Reminder Blast", type: "SMS", status: "Completed", sent: 120, opened: 115, converted: 45 },
    { id: 3, name: "Holiday Service Promo", type: "Email", status: "Draft", sent: 0, opened: 0, converted: 0 }
  ];

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Marketing Campaigns</h1>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Open Rate</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42.5%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Conversion</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.2%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Generated</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CAMPAIGN NAME</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>SENT</TableHead>
                  <TableHead>OPENED</TableHead>
                  <TableHead>CONVERSIONS</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {campaign.type === 'Email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        {campaign.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.sent}</TableCell>
                    <TableCell>{campaign.opened}</TableCell>
                    <TableCell>{campaign.converted}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Report</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}