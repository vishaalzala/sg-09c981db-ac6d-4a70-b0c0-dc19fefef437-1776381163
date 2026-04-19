import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function AllInvoices() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadInvoices(c.id);
      }
    });
  }, []);

  const loadInvoices = async (cId: string) => {
    const { data } = await supabase
      .from("invoices")
      .select(`
        *,
        customer:customers!invoices_customer_id_fkey(name),
        vehicle:vehicles!invoices_vehicle_id_fkey(registration_number, make, model),
        invoice_items:invoice_line_items(quantity, unit_price, discount)
      `)
      .eq("company_id", cId)
      .order("created_at", { ascending: false });

    const invoicesWithCalculatedTotals = data?.map(invoice => {
      if (!invoice.total_amount && invoice.invoice_items && Array.isArray(invoice.invoice_items)) {
        const calculatedTotal = invoice.invoice_items.reduce((sum: number, item: any) => {
          const itemTotal = (item.quantity || 0) * (item.unit_price || 0) * (1 - (item.discount || 0) / 100);
          return sum + itemTotal;
        }, 0);
        return { ...invoice, total_amount: calculatedTotal };
      }
      return invoice;
    });

    setInvoices(invoicesWithCalculatedTotals || []);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchTerm) return true;
    const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer;
    const vehicle = Array.isArray(invoice.vehicle) ? invoice.vehicle[0] : invoice.vehicle;
    
    return (
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Invoices</h1>
          <div className="flex gap-2">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => router.push("/dashboard/invoices/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>INVOICE #</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead>VEHICLE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>AMOUNT</TableHead>
                  <TableHead>DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const customer = Array.isArray(invoice.customer) ? invoice.customer[0] : invoice.customer;
                  const vehicle = Array.isArray(invoice.vehicle) ? invoice.vehicle[0] : invoice.vehicle;

                  return (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                    >
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{customer?.name || "N/A"}</TableCell>
                      <TableCell>
                        {vehicle ? `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          invoice.status === "paid" && "bg-green-100 text-green-800",
                          invoice.status === "unpaid" && "bg-yellow-100 text-yellow-800",
                          invoice.status === "overdue" && "bg-red-100 text-red-800"
                        )}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>${invoice.total_amount ? invoice.total_amount.toFixed(2) : "0.00"}</TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}