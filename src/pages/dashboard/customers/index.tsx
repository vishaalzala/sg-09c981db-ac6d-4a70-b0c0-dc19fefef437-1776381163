import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useRouter } from "next/router";

export default function CustomersList() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [filterBalance, setFilterBalance] = useState(false);
  const [filterCompany, setFilterCompany] = useState(false);
  const [filterIndividual, setFilterIndividual] = useState(false);

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadCustomers(c.id);
      }
    });
  }, []);

  const loadCustomers = async (cId: string) => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", cId)
      .order("name");
    setCustomers(data || []);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.mobile?.includes(searchTerm) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterCompany && !c.is_company) return false;
    if (filterIndividual && c.is_company) return false;
    
    return matchesSearch;
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Customers</h1>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download</Button>
            <Button onClick={() => router.push("/dashboard/customers/new")}>
              <Plus className="h-4 w-4 mr-2" /> New Customer
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={filterBalance} onChange={(e) => setFilterBalance(e.target.checked)} />
                  With positive balances only
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={filterCompany} onChange={(e) => setFilterCompany(e.target.checked)} />
                  Companies only
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={filterIndividual} onChange={(e) => setFilterIndividual(e.target.checked)} />
                  Individuals only
                </label>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CUST NO#</TableHead>
                  <TableHead>NAME</TableHead>
                  <TableHead>PHONE</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>ADDRESS</TableHead>
                  <TableHead className="text-right">BALANCE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                  >
                    <TableCell>{customer.customer_number || "N/A"}</TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile || customer.phone || "N/A"}</TableCell>
                    <TableCell>{customer.email || "N/A"}</TableCell>
                    <TableCell>{customer.physical_address || "N/A"}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">$0.00</TableCell>
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