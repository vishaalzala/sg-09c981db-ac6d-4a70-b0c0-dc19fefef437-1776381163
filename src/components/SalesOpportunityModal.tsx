import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { salesOpportunityService } from "@/services/salesOpportunityService";

interface SalesOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  customerId: string;
  vehicleId?: string;
  sourceType?: string;
  sourceId?: string;
  onSaved: () => void;
}

export function SalesOpportunityModal({
  isOpen,
  onClose,
  companyId,
  customerId,
  vehicleId,
  sourceType,
  sourceId,
  onSaved
}: SalesOpportunityModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await salesOpportunityService.createOpportunity({
        company_id: companyId,
        customer_id: customerId,
        vehicle_id: vehicleId || null,
        title,
        notes: notes || null,
        priority,
        estimated_value: parseFloat(estimatedValue) || null,
        status: "new",
        source_type: sourceType || null,
        source_id: sourceId || null,
        created_by: null
      });

      toast({ title: "Opportunity Created", description: "Sales opportunity has been added" });
      onSaved();
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
          <DialogTitle>Add Sales Opportunity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Replace brake pads, New tyres needed"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Value */}
          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value (Optional)</Label>
            <Input
              id="value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="e.g., 450.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details about this opportunity..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save Opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}