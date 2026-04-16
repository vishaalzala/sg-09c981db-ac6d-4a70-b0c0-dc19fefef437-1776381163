import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/jobService";
import { reminderService } from "@/services/reminderService";
import { Calendar } from "lucide-react";

interface JobFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  customerId: string;
  vehicleId: string;
  companyId: string;
  currentOdometer?: number;
  onFinishComplete: () => void;
  onFinishAndPay: () => void;
}

export function JobFinishModal({
  isOpen,
  onClose,
  jobId,
  customerId,
  vehicleId,
  companyId,
  currentOdometer = 0,
  onFinishComplete,
  onFinishAndPay
}: JobFinishModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [finishedTime, setFinishedTime] = useState(new Date().toISOString().slice(0, 16));
  const [odometer, setOdometer] = useState(currentOdometer.toString());
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [nextServiceKms, setNextServiceKms] = useState("");
  const [wheelAlignmentDue, setWheelAlignmentDue] = useState("");
  const [wofDueDate, setWofDueDate] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [nextServiceNote, setNextServiceNote] = useState("");
  const [followUp, setFollowUp] = useState("");

  const handleFinish = async (openPayment: boolean = false) => {
    setLoading(true);
    try {
      // Update job with finish details
      await jobService.updateJob(jobId, {
        status: "completed",
        finished_at: finishedTime,
        finished_odometer: parseInt(odometer) || 0,
        next_service_date: nextServiceDate || null,
        next_service_kms: parseInt(nextServiceKms) || null,
        next_service_note: nextServiceNote || null,
        wheel_alignment_due: wheelAlignmentDue || null,
        wof_due_date: wofDueDate || null,
        sms_sent: sendSms,
        email_sent: sendEmail,
        follow_up: followUp || null
      } as any);

      // Create automatic reminders
      const reminderPromises = [];

      if (nextServiceDate) {
        reminderPromises.push(
          reminderService.createReminder({
            company_id: companyId,
            customer_id: customerId,
            vehicle_id: vehicleId,
            reminder_type: "service_due",
            due_date: nextServiceDate,
            status: "pending",
            is_recurring: false
          } as any)
        );
      }

      if (wheelAlignmentDue) {
        reminderPromises.push(
          reminderService.createReminder({
            company_id: companyId,
            customer_id: customerId,
            vehicle_id: vehicleId,
            reminder_type: "wheel_alignment_due",
            due_date: wheelAlignmentDue,
            status: "pending",
            is_recurring: false
          } as any)
        );
      }

      if (wofDueDate) {
        reminderPromises.push(
          reminderService.createReminder({
            company_id: companyId,
            customer_id: customerId,
            vehicle_id: vehicleId,
            reminder_type: "wof_due",
            due_date: wofDueDate,
            status: "pending",
            is_recurring: false
          } as any)
        );
      }

      await Promise.all(reminderPromises);

      toast({ 
        title: "Job Finished", 
        description: "Job completed and reminders created successfully" 
      });

      onClose();
      
      if (openPayment) {
        onFinishAndPay();
      } else {
        onFinishComplete();
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finish Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Finished Time */}
          <div className="grid gap-2">
            <Label htmlFor="finished-time">Finished Time</Label>
            <Input
              id="finished-time"
              type="datetime-local"
              value={finishedTime}
              onChange={(e) => setFinishedTime(e.target.value)}
            />
          </div>

          {/* Current Odometer */}
          <div className="grid gap-2">
            <Label htmlFor="odometer">Current Odometer (km)</Label>
            <Input
              id="odometer"
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="Enter odometer reading"
            />
          </div>

          {/* Next Service */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="next-service-date">Next Service Date</Label>
              <Input
                id="next-service-date"
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="next-service-kms">Next Service KMs</Label>
              <Input
                id="next-service-kms"
                type="number"
                value={nextServiceKms}
                onChange={(e) => setNextServiceKms(e.target.value)}
                placeholder="e.g., 110000"
              />
            </div>
          </div>

          {/* Wheel Alignment Due */}
          <div className="grid gap-2">
            <Label htmlFor="wheel-alignment">Wheel Alignment Due Date</Label>
            <Input
              id="wheel-alignment"
              type="date"
              value={wheelAlignmentDue}
              onChange={(e) => setWheelAlignmentDue(e.target.value)}
            />
          </div>

          {/* WOF Due */}
          <div className="grid gap-2">
            <Label htmlFor="wof-due">WOF Due Date</Label>
            <Input
              id="wof-due"
              type="date"
              value={wofDueDate}
              onChange={(e) => setWofDueDate(e.target.value)}
            />
          </div>

          {/* Communication Options */}
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-sms"
                checked={sendSms}
                onCheckedChange={(checked) => setSendSms(checked as boolean)}
              />
              <Label htmlFor="send-sms" className="cursor-pointer">
                Send SMS (Job completed notification)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <Label htmlFor="send-email" className="cursor-pointer">
                Send Email (Job summary and invoice)
              </Label>
            </div>
          </div>

          {/* Next Service Note */}
          <div className="grid gap-2">
            <Label htmlFor="next-service-note">Next Service Note</Label>
            <Textarea
              id="next-service-note"
              value={nextServiceNote}
              onChange={(e) => setNextServiceNote(e.target.value)}
              placeholder="Add notes for next service..."
              rows={3}
            />
          </div>

          {/* Follow Up */}
          <div className="grid gap-2">
            <Label htmlFor="follow-up">Follow Up</Label>
            <Textarea
              id="follow-up"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Add follow-up tasks or notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleFinish(false)} 
            disabled={loading}
          >
            Finish
          </Button>
          <Button 
            onClick={() => handleFinish(true)} 
            disabled={loading}
          >
            Finish & Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}