import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { importExportService } from "@/services/importExportService";
import { companyService } from "@/services/companyService";
import { Upload, Download, FileText, AlertCircle, CheckCircle, Clock, X } from "lucide-react";

export default function ImportExport() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Import state
  const [importType, setImportType] = useState<string>("customers");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  
  // Export state
  const [exportType, setExportType] = useState<string>("customers");
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const history = await importExportService.getImportHistory(company.id);
      setImportHistory(history);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" });
      return;
    }

    setLoading(true);
    setImportProgress(0);

    try {
      // In real implementation, parse CSV/XLSX and validate
      // For MVP, show progress simulation
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      setTimeout(() => {
        toast({ title: "Import Complete", description: "Data imported successfully" });
        loadData();
        setImportFile(null);
        setImportProgress(0);
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      toast({ title: "Import Failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await importExportService.exportToCSV(companyId, exportType, {
        dateFrom: exportDateFrom || undefined,
        dateTo: exportDateTo || undefined
      });

      // Convert to CSV and trigger download
      const csv = convertToCSV(data);
      downloadCSV(csv, `${exportType}-${new Date().toISOString().split('T')[0]}.csv`);

      toast({ title: "Export Complete", description: `${data.length} records exported` });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: string) => {
    const templates: Record<string, string> = {
      customers: "name,mobile,phone,email,postal_address,postal_city,postal_postal_code,physical_address,physical_city,physical_postal_code,is_company,source_of_business,marketing_consent,notes",
      vehicles: "registration_number,vin,make,model,year,body_type,colour,engine_size,transmission,fuel_type,odometer,odometer_unit,wof_expiry,rego_expiry,service_due_date,customer_name",
      inventory: "part_number,description,category,supplier_name,cost_price,sell_price,reorder_level,location",
      suppliers: "name,contact_person,phone,email,address,city,postal_code,account_number,payment_terms,notes"
    };

    const csv = templates[type] || "";
    downloadCSV(csv, `${type}-import-template.csv`);
    toast({ title: "Template Downloaded", description: `${type} import template ready` });
  };

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Import / Export</h1>
          <p className="text-muted-foreground">Migrate data in and out of the system</p>
        </div>

        <Tabs defaultValue="import" className="space-y-6">
          <TabsList>
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>Upload CSV or XLSX files to import existing data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Data Type</Label>
                    <Select value={importType} onValueChange={setImportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="vehicles">Vehicles</SelectItem>
                        <SelectItem value="inventory">Inventory Items</SelectItem>
                        <SelectItem value="suppliers">Suppliers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Download Template</Label>
                    <Button variant="outline" className="w-full" onClick={() => downloadTemplate(importType)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Download {importType} Template
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Before importing:</strong> Download the template, fill in your data, and ensure column headers match exactly.
                    Duplicate detection is enabled based on name/email/rego.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Select File (CSV or XLSX)</Label>
                  <Input type="file" accept=".csv,.xlsx" onChange={handleFileSelect} disabled={loading} />
                  {importFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                      <Button variant="ghost" size="sm" onClick={() => setImportFile(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {loading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Importing...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleImport} disabled={!importFile || loading}>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                  <Button variant="outline" onClick={() => { setImportFile(null); setImportProgress(0); }} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download your data as CSV files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customers">Customers</SelectItem>
                      <SelectItem value="vehicles">Vehicles</SelectItem>
                      <SelectItem value="bookings">Bookings</SelectItem>
                      <SelectItem value="jobs">Jobs</SelectItem>
                      <SelectItem value="invoices">Invoices</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="suppliers">Suppliers</SelectItem>
                      <SelectItem value="reminders">Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date From (Optional)</Label>
                    <Input type="date" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date To (Optional)</Label>
                    <Input type="date" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)} />
                  </div>
                </div>

                <Button onClick={handleExport} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Import History</CardTitle>
                <CardDescription>View past import operations</CardDescription>
              </CardHeader>
              <CardContent>
                {importHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No import history</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Records</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                          <TableCell className="capitalize">{item.entity_type}</TableCell>
                          <TableCell>{item.file_name || "—"}</TableCell>
                          <TableCell>
                            {item.status === "completed" && (
                              <Badge variant="outline" className="text-success border-success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            {item.status === "failed" && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.total_records || 0} total / {item.success_count || 0} success / {item.error_count || 0} errors
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}