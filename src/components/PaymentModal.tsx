import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { DollarSign, Plus, Trash2, Printer, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  companyId: string;
  totalAmount: number;
  totalPaid: number;
  onPaymentComplete: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  invoiceId,
  companyId,
  totalAmount,
  totalPaid,
  onPaymentComplete
}: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([{ payment_method_id: "", amount: 0 }]);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [processing, setProcessing] = useState(false);

  const balanceDue = totalAmount - totalPaid;

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      // Pre-fill with balance due
      setSplits([{ payment_method_id: "", amount: balanceDue }]);
    }
  }, [isOpen, balanceDue]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods(companyId);
      setPaymentMethods(methods);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addSplit = () => {
    setSplits([...splits, { payment_method_id: "", amount: 0 }]);
  };

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      setSplits(splits.filter((_, i) => i !== index));
    }
  };

  const updateSplit = (index: number, field: string, value: any) => {
    const updated = [...splits];
    updated[index] = { ...updated[index], [field]: value };
    setSplits(updated);
  };

  const payFully = () => {
    const remaining = balanceDue - totalSplitAmount;
    if (splits.length === 1) {
      updateSplit(0, "amount", balanceDue);
    } else {
      addSplit();
      const newIndex = splits.length;
      setTimeout(() => updateSplit(newIndex, "amount", remaining), 0);
    }
  };

  const calculateFee = (methodId: string, amount: number) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method || !method.has_fee) return 0;

    if (method.fee_type === "percentage") {
      return (amount * (method.fee_amount / 100));
    } else {
      return method.fee_amount;
    }
  };

  const totalSplitAmount = splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
  const totalFees = splits.reduce((sum, split) => {
    const fee = calculateFee(split.payment_method_id, parseFloat(split.amount) || 0);
    return sum + fee;
  }, 0);
  const grandTotal = totalSplitAmount + totalFees;

  const handlePay = async (printReceipt = false) => {
    // Validation
    if (splits.some(s => !s.payment_method_id)) {
      toast({ title: "Validation Error", description: "Please select payment method for all splits", variant: "destructive" });
      return;
    }

    if (totalSplitAmount === 0) {
      toast({ title: "Validation Error", description: "Payment amount cannot be zero", variant: "destructive" });
      return;
    }

    if (totalSplitAmount > balanceDue) {
      toast({ title: "Validation Error", description: "Payment amount exceeds balance due", variant: "destructive" });
      return;
    }

    setProcessing(true);
    try {
      const splitData = splits.map(split => {
        const method = paymentMethods.find(m => m.id === split.payment_method_id);
        const amount = parseFloat(split.amount) || 0;
        const fee = calculateFee(split.payment_method_id, amount);
        return {
          payment_method_id: split.payment_method_id,
          method_name: method?.name || "",
          amount,
          fee_amount: fee,
          total_amount: amount + fee
        };
      });

      await paymentService.createPayment(invoiceId, {
        company_id: companyId,
        totalAmount: totalSplitAmount,
        totalFees,
        date: paymentDate,
        reference,
        splits: splitData,
        created_by: null // Will be set by RLS
      });

      toast({ title: "Payment Recorded", description: `Payment of $${totalSplitAmount.toFixed(2)} recorded successfully` });

      if (printReceipt) {
        // TODO: Implement print receipt
        console.log("Print receipt");
      }

      onPaymentComplete();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Card */}
          <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Payable:</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid Total:</span>
              <span className="font-semibold text-success">${totalPaid.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-semibold">Balance Due:</span>
              <span className="text-lg font-bold text-primary">${balanceDue.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Splits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Payment Methods</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={payFully}
                >
                  Pay Fully
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSplit}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Split
                </Button>
              </div>
            </div>

            {splits.map((split, index) => {
              const method = paymentMethods.find(m => m.id === split.payment_method_id);
              const amount = parseFloat(split.amount) || 0;
              const fee = calculateFee(split.payment_method_id, amount);
              const splitTotal = amount + fee;

              return (
                <div key={index} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Payment Method</Label>
                        <Select
                          value={split.payment_method_id}
                          onValueChange={(value) => updateSplit(index, "payment_method_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map(method => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.name}
                                {method.has_fee && ` (+${method.fee_type === "percentage" ? `${method.fee_amount}%` : `$${method.fee_amount}`})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={split.amount || ""}
                          onChange={(e) => updateSplit(index, "amount", e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    {splits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeSplit(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {method?.has_fee && fee > 0 && (
                    <div className="text-xs text-muted-foreground flex justify-between px-1">
                      <span>Fee ({method.fee_type === "percentage" ? `${method.fee_amount}%` : `$${method.fee_amount}`}):</span>
                      <span className="font-medium">${fee.toFixed(2)}</span>
                    </div>
                  )}

                  {splitTotal > 0 && (
                    <div className="text-sm font-semibold flex justify-between px-1 pt-1 border-t">
                      <span>Split Total:</span>
                      <span>${splitTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Reference / Receipt #</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-4 border rounded-lg bg-primary/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Amount:</span>
              <span className="font-semibold">${totalSplitAmount.toFixed(2)}</span>
            </div>
            {totalFees > 0 && (
              <div className="flex justify-between text-sm text-warning">
                <span>Total Fees:</span>
                <span className="font-semibold">${totalFees.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total:</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Remaining Balance:</span>
              <span className="font-medium">${(balanceDue - totalSplitAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Validation Warnings */}
          {totalSplitAmount > balanceDue && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payment amount (${totalSplitAmount.toFixed(2)}) exceeds balance due (${balanceDue.toFixed(2)})
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePay(true)}
            disabled={processing || totalSplitAmount === 0 || totalSplitAmount > balanceDue}
          >
            <Printer className="h-4 w-4 mr-2" />
            Pay & Print
          </Button>
          <Button
            onClick={() => handlePay(false)}
            disabled={processing || totalSplitAmount === 0 || totalSplitAmount > balanceDue}
          >
            {processing ? "Processing..." : "Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}