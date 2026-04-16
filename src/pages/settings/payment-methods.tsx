import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { paymentService } from "@/services/paymentService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Edit, Trash2, GripVertical, DollarSign } from "lucide-react";

export default function PaymentMethodsSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [methods, setMethods] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    has_fee: false,
    fee_type: "percentage",
    fee_amount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const methodsData = await paymentService.getPaymentMethods(company.id);
      setMethods(methodsData);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setFormData({
      name: "",
      type: "cash",
      has_fee: false,
      fee_type: "percentage",
      fee_amount: 0
    });
    setShowDialog(true);
  };

  const handleEdit = (method: any) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      has_fee: method.has_fee,
      fee_type: method.fee_type || "percentage",
      fee_amount: method.fee_amount || 0
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingMethod) {
        await paymentService.updatePaymentMethod(editingMethod.id, formData);
        toast({ title: "Updated", description: "Payment method updated successfully" });
      } else {
        await paymentService.createPaymentMethod({
          ...formData,
          company_id: companyId,
          display_order: methods.length + 1
        });
        toast({ title: "Created", description: "Payment method created successfully" });
      }
      setShowDialog(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;

    try {
      await paymentService.deletePaymentMethod(id);
      toast({ title: "Deleted", description: "Payment method deleted successfully" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">Manage accepted payment methods and processing fees</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Payment Methods</CardTitle>
            <CardDescription>
              Configure the payment methods your workshop accepts. Drag to reorder how they appear in payment forms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {methods.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment methods configured</p>
                <Button variant="link" onClick={handleCreate}>Add your first payment method</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {methods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{method.name}</span>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                          {method.type}
                        </span>
                      </div>
                      {method.has_fee && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Processing fee: {method.fee_type === "percentage" 
                            ? `${method.fee_amount}%` 
                            : `$${method.fee_amount.toFixed(2)}`}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Edit" : "Create"} Payment Method</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Method Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Credit Card, Cash, Bank Transfer"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="eftpos">EFTPOS</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Has Processing Fee</Label>
                <p className="text-xs text-muted-foreground">Add a surcharge for this payment method</p>
              </div>
              <Switch
                checked={formData.has_fee}
                onCheckedChange={(checked) => setFormData({ ...formData, has_fee: checked })}
              />
            </div>

            {formData.has_fee && (
              <>
                <div>
                  <Label>Fee Type</Label>
                  <Select 
                    value={formData.fee_type} 
                    onValueChange={(value) => setFormData({ ...formData, fee_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fee Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fee_amount}
                    onChange={(e) => setFormData({ ...formData, fee_amount: parseFloat(e.target.value) })}
                    placeholder={formData.fee_type === "percentage" ? "e.g., 1.5" : "e.g., 2.50"}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.fee_type === "percentage" 
                      ? "Enter percentage (e.g., 1.5 for 1.5%)" 
                      : "Enter fixed dollar amount"}
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name}>
              {editingMethod ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}