import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Phone, Mail } from "lucide-react";
import { supplierService } from "@/services/supplierService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function SuppliersPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    account_number: "",
    notes: "",
    is_preferred: false,
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
      const data = await supplierService.getSuppliers(company.id);
      setSuppliers(data);
    }
    setLoading(false);
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name) {
      toast({ title: "Error", description: "Supplier name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const company = await companyService.getCurrentCompany();
      if (!company) throw new Error("No company context found");

      await supplierService.createSupplier({
        ...newSupplier,
        company_id: company.id,
      } as any);

      toast({ title: "Success", description: "Supplier created successfully" });
      setShowAddDialog(false);
      setNewSupplier({ name: "", phone: "", email: "", account_number: "", notes: "", is_preferred: false });
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
          <Button onClick={() => setShowAddDialog(true)}>
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

      {/* Add Supplier Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                placeholder="Repco Auto Parts"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="09 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="orders@supplier.co.nz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                value={newSupplier.account_number}
                onChange={(e) => setNewSupplier({ ...newSupplier, account_number: e.target.value })}
                placeholder="ACC123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newSupplier.notes}
                onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                placeholder="Delivery days, special terms, etc."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_preferred"
                checked={newSupplier.is_preferred}
                onCheckedChange={(checked) => setNewSupplier({ ...newSupplier, is_preferred: checked as boolean })}
              />
              <Label htmlFor="is_preferred">Mark as preferred supplier</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateSupplier} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}