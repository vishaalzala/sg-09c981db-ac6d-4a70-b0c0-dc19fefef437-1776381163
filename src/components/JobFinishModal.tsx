import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface JobFinishModalProps {
  open: boolean;
  onClose: () => void;
  job: any;
  onComplete: () => void;
}

export function JobFinishModal({ open, onClose, job, onComplete }: JobFinishModalProps) {
  const { toast } = useToast();
  const [finishType, setFinishType] = useState("invoice");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [workDone, setWorkDone] = useState("");
  const [nextService, setNextService] = useState("");
  const [communication, setCommunication] = useState("");
  const [sms, setSms] = useState("");

  const handleFinish = () => {
    if (finishType === "invoice") {
      // Convert to invoice logic
      toast({ title: "Success", description: "Job converted to invoice successfully" });
    } else {
      // Finish without invoice logic
      toast({ title: "Success", description: "Job finished successfully" });
    }
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{job.job_number || job.invoice_number} - Finish Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Finish Type Selection */}
          <div className="space-y-2">
            <Label>Finish Type</Label>
            <Select value={finishType} onValueChange={setFinishType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Convert to Invoice</SelectItem>
                <SelectItem value="finish">Finish Without Invoice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {finishType === "invoice" && (
            <>
              {/* Invoice Date */}
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              {/* Work Done */}
              <div className="space-y-2">
                <Label>Work Done</Label>
                <Textarea
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  placeholder="Describe work completed..."
                  rows={3}
                />
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bill To</Label>
                  <Input value={job.customer?.name || "Customer"} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Input value="Service" disabled />
                </div>
              </div>
            </>
          )}

          {/* Next Service */}
          <div className="space-y-2">
            <Label>Next Service Date/Odo</Label>
            <Input
              value={nextService}
              onChange={(e) => setNextService(e.target.value)}
              placeholder="Optional: Set next service reminder"
            />
          </div>

          {/* Communication Options */}
          <div className="space-y-2">
            <Label>Communication</Label>
            <Select value={communication} onValueChange={setCommunication}>
              <SelectTrigger>
                <SelectValue placeholder="Select communication method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send email when ready</SelectItem>
                <SelectItem value="sms">Send SMS when ready</SelectItem>
                <SelectItem value="both">Send both email and SMS</SelectItem>
                <SelectItem value="none">No communication</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SMS Content */}
          {(communication === "sms" || communication === "both") && (
            <div className="space-y-2">
              <Label>SMS Content</Label>
              <Textarea
                value={sms}
                onChange={(e) => setSms(e.target.value)}
                placeholder="Your vehicle is ready for pickup..."
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleFinish} className="flex-1">
              Finish
            </Button>
            <Button onClick={handleFinish} variant="secondary" className="flex-1">
              Finish & Pay
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}