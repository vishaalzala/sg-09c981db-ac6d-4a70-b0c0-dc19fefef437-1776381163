import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { discountService } from "@/services/discountService";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "quote" | "invoice";
  entityId: string;
  companyId: string;
  subtotal: number;
  onDiscountApplied: () => void;
}

export function DiscountModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  companyId,
  subtotal,
  onDiscountApplied
}: DiscountModalProps) {
  const { toast } = useToast();
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateDiscountAmount = () => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === "percentage") {
      return (subtotal * value / 100);
    }
    return value;
  };

  const discountAmount = calculateDiscountAmount();
  const newSubtotal = subtotal - discountAmount;
  const newTax = newSubtotal * 0.15; // 15% GST
  const newTotal = newSubtotal + newTax;

  const handleApplyDiscount = async () => {
    if (!discountValue || parseFloat(discountValue) <= 0) {
      toast({ title: "Error", description: "Please enter a valid discount value", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await discountService.applyDiscount({
        company_id: companyId,
        entity_type: entityType,
        entity_id: entityId,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        subtotal,
        reason
      });

      toast({ title: "Discount Applied", description: `${discountType === "percentage" ? discountValue + "%" : "$" + discountValue} discount applied successfully` });
      onDiscountApplied();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Discount Type */}
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup value={discountType} onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="cursor-pointer font-normal">Percentage (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="cursor-pointer font-normal">Fixed Amount ($)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label htmlFor="discount-value">
              {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
            </Label>
            <Input
              id="discount-value"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 50.00"}
              min="0"
              step={discountType === "percentage" ? "1" : "0.01"}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Loyal customer discount, Price match, Promotion"
              rows={2}
            />
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
            <div className="flex justify-between text-sm">
              <span>Original Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>Discount:</span>
              <span className="font-medium">-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>New Subtotal:</span>
              <span className="font-medium">${newSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (15%):</span>
              <span className="font-medium">${newTax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>New Total:</span>
              <span className="text-primary">${newTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleApplyDiscount} disabled={loading}>
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}