import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Phone, Mail } from "lucide-react";
import { supplierService } from "@/services/supplierService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";

export default function SuppliersPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const data = await supplierService.getSuppliers(company.id);
      setSuppliers(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Suppliers</h1>
            <p className="text-muted-foreground mt-1">
              Manage parts suppliers and vendors
            </p>
          </div>
          <Button onClick={() => window.location.href = "/suppliers/new"}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Suppliers List */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers Directory</CardTitle>
            <CardDescription>Your parts suppliers and service providers</CardDescription>
          </CardHeader>
          <CardContent>
            {suppliers.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No suppliers"
                description="Add your first supplier to start managing inventory and purchase orders"
                action={{
                  label: "Add Supplier",
                  onClick: () => window.location.href = "/suppliers/new",
                }}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((supplier) => (
                  <Card
                    key={supplier.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/suppliers/${supplier.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Building2 className="h-8 w-8 text-primary" />
                        {supplier.is_preferred && (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                            Preferred
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">{supplier.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{supplier.email}</span>
                        </div>
                      )}
                      {supplier.account_number && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Account: {supplier.account_number}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}