import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PaymentMethodSettings() {
  const paymentMethods = [
    { name: "Cash", enabled: true, surcharge: 0 },
    { name: "EFTPOS", enabled: true, surcharge: 0 },
    { name: "Credit Card", enabled: true, surcharge: 2 },
    { name: "Afterpay", enabled: true, surcharge: 0 },
    { name: "Bank Transfer", enabled: false, surcharge: 0 },
    { name: "ZIP", enabled: false, surcharge: 0 },
    { name: "Chargeback", enabled: true, surcharge: 0 },
    { name: "Other", enabled: true, surcharge: 0 }
  ];

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Payment Methods</h1>

        <Card>
          <CardHeader>
            <CardTitle>Configure Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PAYMENT METHOD</TableHead>
                  <TableHead>ENABLED</TableHead>
                  <TableHead>SURCHARGE (%)</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.name}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>
                      <Switch defaultChecked={method.enabled} />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        defaultValue={method.surcharge}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Gateway Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Stripe API Key</Label>
              <Input type="password" placeholder="sk_live_..." />
            </div>

            <div className="space-y-2">
              <Label>PayPal Client ID</Label>
              <Input type="password" placeholder="Enter PayPal Client ID" />
            </div>

            <Button>Save Gateway Settings</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}