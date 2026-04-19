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

export default function AllQuotes() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [quotes, setQuotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadQuotes(c.id);
      }
    });
  }, []);

  const loadQuotes = async (cId: string) => {
    const { data } = await supabase
      .from("quotes")
      .select(`
        *,
        customer:customers!quotes_customer_id_fkey(name),
        vehicle:vehicles!quotes_vehicle_id_fkey(registration_number, make, model)
      `)
      .eq("company_id", cId)
      .order("created_at", { ascending: false });
    setQuotes(data || []);
  };

  const filteredQuotes = quotes.filter(quote => {
    if (!searchTerm) return true;
    const customer = Array.isArray(quote.customer) ? quote.customer[0] : quote.customer;
    const vehicle = Array.isArray(quote.vehicle) ? quote.vehicle[0] : quote.vehicle;
    
    return (
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Quotes</h1>
          <div className="flex gap-2">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => router.push("/dashboard/quotes/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QUOTE #</TableHead>
                  <TableHead>CUSTOMER</TableHead>
                  <TableHead>VEHICLE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>AMOUNT</TableHead>
                  <TableHead>DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const customer = Array.isArray(quote.customer) ? quote.customer[0] : quote.customer;
                  const vehicle = Array.isArray(quote.vehicle) ? quote.vehicle[0] : quote.vehicle;

                  return (
                    <TableRow
                      key={quote.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                    >
                      <TableCell className="font-medium">{quote.quote_number}</TableCell>
                      <TableCell>{customer?.name || "N/A"}</TableCell>
                      <TableCell>
                        {vehicle ? `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}` : "N/A"}
                      </TableCell>
                      <TableCell>{quote.status}</TableCell>
                      <TableCell>${quote.total_amount?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
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