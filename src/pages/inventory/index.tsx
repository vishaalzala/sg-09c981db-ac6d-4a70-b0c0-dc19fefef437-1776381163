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

export default function InventoryPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  const lowStockItems = items.filter(item => 
    (item.quantity_on_hand || 0) <= (item.reorder_point || 0)
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
          <Button onClick={() => window.location.href = "/inventory/new"}>
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
                  const isLowStock = (item.quantity_on_hand || 0) <= (item.reorder_point || 0);
                  const stockLevel = item.quantity_on_hand || 0;

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
                            <span className="font-semibold">{item.item_name}</span>
                            {isLowStock && (
                              <Badge variant="outline" className="text-warning border-warning">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Low Stock
                              </Badge>
                            )}
                          </div>

                          {item.sku && (
                            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                          )}

                          {supplier && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>{supplier.name}</span>
                            </div>
                          )}

                          {item.location && (
                            <p className="text-sm">Location: {item.location}</p>
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

                          {item.unit_price && (
                            <p className="text-sm text-muted-foreground">
                              ${item.unit_price.toFixed(2)} / {item.unit_of_measure || "unit"}
                            </p>
                          )}

                          {item.reorder_point && (
                            <p className="text-xs text-muted-foreground">
                              Reorder at: {item.reorder_point}
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
    </AppLayout>
  );
}