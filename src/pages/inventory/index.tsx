import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<any[]>([]);
  const [showNewStockDialog, setShowNewStockDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeletedOnly, setShowDeletedOnly] = useState(false);
  const [newStock, setNewStock] = useState({
    part_number: "",
    description: "",
    location: "",
    supplier: "",
    quantity_on_hand: "",
    quantity_allocated: "",
    cost_price: "",
    sell_price: "",
    reorder_level: "",
    notes: ""
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .order("description");
    setInventory(data || []);
  };

  const handleCreateStock = async () => {
    const { error } = await supabase
      .from("inventory_items")
      .insert([{
        part_number: newStock.part_number,
        description: newStock.description,
        location: newStock.location,
        supplier: newStock.supplier,
        quantity_on_hand: parseInt(newStock.quantity_on_hand) || 0,
        quantity_allocated: parseInt(newStock.quantity_allocated) || 0,
        cost_price: parseFloat(newStock.cost_price) || 0,
        sell_price: parseFloat(newStock.sell_price) || 0,
        reorder_level: parseInt(newStock.reorder_level) || 0,
        notes: newStock.notes
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create stock item",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Stock item created successfully"
    });

    setShowNewStockDialog(false);
    setNewStock({
      part_number: "",
      description: "",
      location: "",
      supplier: "",
      quantity_on_hand: "",
      quantity_allocated: "",
      cost_price: "",
      sell_price: "",
      reorder_level: "",
      notes: ""
    });
    loadInventory();
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(i => i.id));
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.part_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <AppLayout companyId="">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">All Stocks</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Supplier
            </Button>
            <Button onClick={() => setShowNewStockDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Stock
            </Button>
            <Button variant="outline">
              Settings
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="discontinued"
              checked={showDeletedOnly}
              onCheckedChange={(checked) => setShowDeletedOnly(checked as boolean)}
            />
            <Label htmlFor="discontinued">Discontinued</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="deleted" />
            <Label htmlFor="deleted">Deleted</Label>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === inventory.length}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>No.</TableHead>
                  <TableHead>NAME</TableHead>
                  <TableHead>LOCATION</TableHead>
                  <TableHead>AVAIL./TOTAL QUANTITY</TableHead>
                  <TableHead>SELL PRICE</TableHead>
                  <TableHead>PRICE (INCL. GST)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                    </TableCell>
                    <TableCell>{item.part_number}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      {item.quantity_on_hand - (item.quantity_allocated || 0)} / {item.quantity_on_hand}
                    </TableCell>
                    <TableCell>${item.sell_price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>${(item.sell_price * 1.15)?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* New Stock Dialog */}
      <Dialog open={showNewStockDialog} onOpenChange={setShowNewStockDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Number</Label>
                <Input
                  value={newStock.part_number}
                  onChange={(e) => setNewStock({ ...newStock, part_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newStock.location}
                  onChange={(e) => setNewStock({ ...newStock, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Input
                value={newStock.description}
                onChange={(e) => setNewStock({ ...newStock, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input
                value={newStock.supplier}
                onChange={(e) => setNewStock({ ...newStock, supplier: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity on Hand</Label>
                <Input
                  type="number"
                  value={newStock.quantity_on_hand}
                  onChange={(e) => setNewStock({ ...newStock, quantity_on_hand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity Allocated</Label>
                <Input
                  type="number"
                  value={newStock.quantity_allocated}
                  onChange={(e) => setNewStock({ ...newStock, quantity_allocated: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newStock.cost_price}
                  onChange={(e) => setNewStock({ ...newStock, cost_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sell Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newStock.sell_price}
                  onChange={(e) => setNewStock({ ...newStock, sell_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  value={newStock.reorder_level}
                  onChange={(e) => setNewStock({ ...newStock, reorder_level: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newStock.notes}
                onChange={(e) => setNewStock({ ...newStock, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateStock} className="flex-1">
                Save
              </Button>
              <Button onClick={() => setShowNewStockDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}