import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertTriangle, TrendingDown, Building2 } from "lucide-react";
import { inventoryService } from "@/services/inventoryService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function InventoryPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    part_number: "",
    description: "",
    category: "",
    cost_price: "",
    sell_price: "",
    reorder_level: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const data = await inventoryService.getInventoryItems(company.id);
      setItems(data);
    }
    setLoading(false);
  };

  const handleCreateItem = async () => {
    if (!newItem.description) {
      toast({ title: "Error", description: "Description is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await companyService.getCurrentCompany();
      if (!company) throw new Error("No company context found");

      await inventoryService.createInventoryItem({
        ...newItem,
        company_id: company.id,
        cost_price: newItem.cost_price ? parseFloat(newItem.cost_price) : null,
        sell_price: newItem.sell_price ? parseFloat(newItem.sell_price) : null,
        reorder_level: newItem.reorder_level ? parseInt(newItem.reorder_level) : null,
      } as any);

      toast({ title: "Success", description: "Inventory item created successfully" });
      setShowAddDialog(false);
      setNewItem({ part_number: "", description: "", category: "", cost_price: "", sell_price: "", reorder_level: "" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const lowStockItems = items.filter(item => 
    // Currently stock is tracked via movements, defaulting to 0 for MVP list view
    (0) <= (item.reorder_level || 0)
  );

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Manage parts and stock levels
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg">Low Stock Alert</CardTitle>
              </div>
              <CardDescription>
                {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} below reorder point
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Items</CardTitle>
            <CardDescription>Parts and materials inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No inventory items"
                description="Add your first inventory item to start tracking stock"
                action={{
                  label: "Add Item",
                  onClick: () => window.location.href = "/inventory/new",
                }}
              />
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const supplier = Array.isArray(item.supplier) ? item.supplier[0] : item.supplier;
                  const isLowStock = (0) <= (item.reorder_level || 0);
                  const stockLevel = 0; // Will be calculated from movements

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                        isLowStock && "border-warning/50"
                      )}
                      onClick={() => window.location.href = `/inventory/${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.description || "Unnamed Item"}</span>
                            {isLowStock && (
                              <Badge variant="outline" className="text-warning border-warning">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Low Stock
                              </Badge>
                            )}
                          </div>

                          {item.part_number && (
                            <p className="text-sm text-muted-foreground">Part No: {item.part_number}</p>
                          )}

                          {supplier && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>{supplier.name}</span>
                            </div>
                          )}

                          {item.category && (
                            <p className="text-sm">Category: {item.category}</p>
                          )}
                        </div>

                        <div className="text-right space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">On Hand</p>
                            <p className={cn(
                              "text-2xl font-bold",
                              isLowStock ? "text-warning" : "text-primary"
                            )}>
                              {stockLevel}
                            </p>
                          </div>

                          {item.sell_price && (
                            <p className="text-sm text-muted-foreground">
                              ${item.sell_price.toFixed(2)}
                            </p>
                          )}

                          {item.reorder_level && (
                            <p className="text-xs text-muted-foreground">
                              Reorder at: {item.reorder_level}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Brake Pads - Front"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="part_number">Part Number</Label>
                <Input
                  id="part_number"
                  value={newItem.part_number}
                  onChange={(e) => setNewItem({ ...newItem, part_number: e.target.value })}
                  placeholder="BP-FR-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brakes">Brakes</SelectItem>
                    <SelectItem value="filters">Filters</SelectItem>
                    <SelectItem value="fluids">Fluids</SelectItem>
                    <SelectItem value="tyres">Tyres</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={newItem.cost_price}
                  onChange={(e) => setNewItem({ ...newItem, cost_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sell_price">Sell Price</Label>
                <Input
                  id="sell_price"
                  type="number"
                  step="0.01"
                  value={newItem.sell_price}
                  onChange={(e) => setNewItem({ ...newItem, sell_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  value={newItem.reorder_level}
                  onChange={(e) => setNewItem({ ...newItem, reorder_level: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}