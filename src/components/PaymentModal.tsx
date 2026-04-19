import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoice: any;
  onPaymentComplete: () => void;
}

export function PaymentModal({ open, onClose, invoice, onPaymentComplete }: PaymentModalProps) {
  const { toast } = useToast();
  const [payments, setPayments] = useState({
    cash: "",
    eftpos: "",
    credit_card: "",
    afterpay: "",
    bank_transfer: "",
    zip: "",
    chargeback: "",
    other: ""
  });
  const [surcharge, setSurcharge] = useState(0);
  const [waiveSurcharge, setWaiveSurcharge] = useState(false);
  const [reference, setReference] = useState(`Invoice# ${invoice.invoice_number}`);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const totalPayable = invoice.balance || invoice.total_amount || 0;

  const handlePaymentChange = (method: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPayments({ ...payments, [method]: value });

    // Calculate 2% surcharge for credit card
    if (method === "credit_card" && !waiveSurcharge) {
      setSurcharge(numValue * 0.02);
    }
  };

  const handlePayFully = (method: string) => {
    const remainingAmount = totalPayable - getTotalPaid();
    setPayments({ ...payments, [method]: remainingAmount.toFixed(2) });

    if (method === "credit_card" && !waiveSurcharge) {
      setSurcharge(remainingAmount * 0.02);
    }
  };

  const getTotalPaid = () => {
    return Object.values(payments).reduce((sum, val) => sum + (parseFloat(val as string) || 0), 0);
  };

  const getBalanceDue = () => {
    const totalWithSurcharge = getTotalPaid() + (waiveSurcharge ? 0 : surcharge);
    return totalPayable - totalWithSurcharge;
  };

  const handlePay = () => {
    if (getTotalPaid() === 0) {
      toast({ title: "Error", description: "Please enter a payment amount", variant: "destructive" });
      return;
    }

    // Process payment
    toast({ title: "Success", description: "Payment processed successfully" });
    onPaymentComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Paying #{invoice.invoice_number} - {invoice.customer?.name || "Customer"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Payable */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Payable</span>
              <span className="text-2xl font-bold text-primary">${totalPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {/* Cash */}
            <div className="flex items-center gap-2">
              <Label className="w-32">Cash</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.cash}
                onChange={(e) => handlePaymentChange("cash", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("cash")}>
                Pay fully
              </Button>
            </div>

            {/* EFTPOS */}
            <div className="flex items-center gap-2">
              <Label className="w-32">EFTPOS</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.eftpos}
                onChange={(e) => handlePaymentChange("eftpos", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("eftpos")}>
                Pay fully
              </Button>
            </div>

            {/* Credit Card */}
            <div className="flex items-center gap-2">
              <Label className="w-32">Credit Card</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.credit_card}
                onChange={(e) => handlePaymentChange("credit_card", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("credit_card")}>
                Pay fully
              </Button>
            </div>

            {/* Afterpay */}
            <div className="flex items-center gap-2">
              <Label className="w-32">Afterpay</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.afterpay}
                onChange={(e) => handlePaymentChange("afterpay", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("afterpay")}>
                Pay fully
              </Button>
            </div>

            {/* Bank Transfer */}
            <div className="flex items-center gap-2">
              <Label className="w-32">Bank Transfer</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.bank_transfer}
                onChange={(e) => handlePaymentChange("bank_transfer", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("bank_transfer")}>
                Pay fully
              </Button>
            </div>

            {/* ZIP */}
            <div className="flex items-center gap-2">
              <Label className="w-32">ZIP</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.zip}
                onChange={(e) => handlePaymentChange("zip", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("zip")}>
                Pay fully
              </Button>
            </div>

            {/* Chargeback */}
            <div className="flex items-center gap-2">
              <Label className="w-32">Chargeback</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.chargeback}
                onChange={(e) => handlePaymentChange("chargeback", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("chargeback")}>
                Pay fully
              </Button>
            </div>

            {/* Other */}
            <div className="flex items-center gap-2">
              <Label className="w-32">Other</Label>
              <Input
                type="number"
                step="0.01"
                value={payments.other}
                onChange={(e) => handlePaymentChange("other", e.target.value)}
                placeholder="0"
                className="flex-1"
              />
              <Button variant="link" size="sm" onClick={() => handlePayFully("other")}>
                Pay fully
              </Button>
            </div>
          </div>

          {/* Surcharge */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span>+ 2% surcharge:</span>
              <span className="font-semibold">${surcharge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span></span>
              <span className="font-semibold">${(getTotalPaid() + surcharge).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="waive"
                checked={waiveSurcharge}
                onCheckedChange={(checked) => {
                  setWaiveSurcharge(checked as boolean);
                  if (checked) setSurcharge(0);
                  else if (parseFloat(payments.credit_card) > 0) {
                    setSurcharge(parseFloat(payments.credit_card) * 0.02);
                  }
                }}
              />
              <Label htmlFor="waive">Waive</Label>
            </div>
          </div>

          {/* Reference and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Paid Total</span>
              <span className="font-bold">${(getTotalPaid() + (waiveSurcharge ? 0 : surcharge)).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Balance Due</span>
              <span className="font-bold text-primary">${Math.abs(getBalanceDue()).toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handlePay} className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Pay
            </Button>
            <Button onClick={handlePay} className="flex-1" variant="secondary">
              <DollarSign className="h-4 w-4 mr-2" />
              Pay & Print
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}