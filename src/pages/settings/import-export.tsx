import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Download, Upload } from "lucide-react";

export default function ImportExport() {
  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <h1 className="font-heading text-3xl font-bold">Data Export / Import</h1>

        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your workshop data as CSV or Excel files
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Customers
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Vehicles
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Invoices
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Jobs
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Import data from CSV files. Make sure your file matches the required format.
            </p>
            <div className="space-y-2">
              <Input type="file" accept=".csv,.xlsx" />
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload & Import
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}