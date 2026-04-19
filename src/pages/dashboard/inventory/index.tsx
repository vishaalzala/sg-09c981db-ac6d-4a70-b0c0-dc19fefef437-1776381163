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

export default function InventoryList() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<any[]>([]);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    companyService.getCurrentCompany().then(c => {
      if (c) {
        setCompanyId(c.id);
        loadInventory(c.id);
      }
    });
  }, []);

  const loadInventory = async (cId: string) => {
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("company_id", cId)
      .order("description");
    setInventory(data || []);
  };

  const filteredInventory = inventory.filter(item => {
    if (!item.is_active && !showDeactivated) return false;
    return item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.part_number?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Stocks</h1>
          <div className="flex gap-2">
            <Button variant="outline">Bulk Action ▼</Button>
            <Button variant="outline">Reorder</Button>
            <Button variant="outline">Settings ▼</Button>
            <Button onClick={() => router.push("/dashboard/inventory/new")}>
              <Plus className="h-4 w-4 mr-2" /> New Stock
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
                  <input type="checkbox" checked={showDeactivated} onChange={(e) => setShowDeactivated(e.target.checked)} />
                  Deactivated
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
                  Deleted
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Show suggested reorder stocks
                </label>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>NO.</TableHead>
                  <TableHead>NAME</TableHead>
                  <TableHead>LOCATION</TableHead>
                  <TableHead>AVAIL / TOTAL QUANTITY</TableHead>
                  <TableHead className="text-right">SELL PRICE</TableHead>
                  <TableHead className="text-right">PRICE (INCL GST)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const sellPrice = item.sell_price || 0;
                  const priceWithGst = sellPrice * 1.15; // Assuming 15% GST for NZ

                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell><input type="checkbox" /></TableCell>
                      <TableCell className="font-medium">{item.part_number || "N/A"}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.location || "N/A"}</TableCell>
                      <TableCell>
                        {item.quantity_on_hand - (item.quantity_allocated || 0)} / {item.quantity_on_hand}
                      </TableCell>
                      <TableCell className="text-right">${sellPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${priceWithGst.toFixed(2)}</TableCell>
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