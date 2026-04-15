import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobStatus = "booked" | "checked_in" | "in_progress" | "waiting_approval" | "waiting_parts" | "paused" | "ready_for_pickup" | "completed" | "invoiced" | "closed";
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
type QuoteStatus = "draft" | "sent" | "approved" | "partially_approved" | "declined" | "expired" | "converted";
type InvoiceStatus = "draft" | "sent" | "partial_paid" | "paid" | "overdue" | "cancelled";
type WOFStatus = "pass" | "fail";

interface StatusBadgeProps {
  status: JobStatus | BookingStatus | QuoteStatus | InvoiceStatus | WOFStatus | string;
  type?: "job" | "booking" | "quote" | "invoice" | "wof";
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  // Job statuses
  booked: { label: "Booked", variant: "secondary", className: "bg-secondary/20 text-secondary-foreground border-secondary" },
  checked_in: { label: "Checked In", variant: "default", className: "bg-primary/20 text-primary border-primary" },
  in_progress: { label: "In Progress", variant: "default", className: "bg-accent/20 text-accent-foreground border-accent" },
  waiting_approval: { label: "Waiting Approval", variant: "outline", className: "bg-warning/20 text-warning-foreground border-warning" },
  waiting_parts: { label: "Waiting Parts", variant: "outline", className: "bg-warning/20 text-warning-foreground border-warning" },
  paused: { label: "Paused", variant: "outline", className: "bg-muted text-muted-foreground border-muted-foreground" },
  ready_for_pickup: { label: "Ready for Pickup", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  completed: { label: "Completed", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  invoiced: { label: "Invoiced", variant: "default", className: "bg-primary/20 text-primary border-primary" },
  closed: { label: "Closed", variant: "outline", className: "bg-muted text-muted-foreground" },
  
  // Booking statuses
  pending: { label: "Pending", variant: "secondary", className: "bg-secondary/20 text-secondary-foreground border-secondary" },
  confirmed: { label: "Confirmed", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  cancelled: { label: "Cancelled", variant: "destructive", className: "bg-destructive/20 text-destructive border-destructive" },
  no_show: { label: "No Show", variant: "destructive", className: "bg-destructive/20 text-destructive border-destructive" },
  
  // Quote statuses
  draft: { label: "Draft", variant: "outline", className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", variant: "default", className: "bg-primary/20 text-primary border-primary" },
  approved: { label: "Approved", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  partially_approved: { label: "Partially Approved", variant: "default", className: "bg-warning/20 text-warning-foreground border-warning" },
  declined: { label: "Declined", variant: "destructive", className: "bg-destructive/20 text-destructive border-destructive" },
  expired: { label: "Expired", variant: "outline", className: "bg-muted text-muted-foreground" },
  converted: { label: "Converted", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  
  // Invoice statuses
  partial_paid: { label: "Partial Paid", variant: "default", className: "bg-warning/20 text-warning-foreground border-warning" },
  paid: { label: "Paid", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  overdue: { label: "Overdue", variant: "destructive", className: "bg-destructive/20 text-destructive border-destructive" },
  
  // WOF statuses
  pass: { label: "Pass", variant: "default", className: "bg-success/20 text-success-foreground border-success" },
  fail: { label: "Fail", variant: "destructive", className: "bg-destructive/20 text-destructive border-destructive" },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };
  
  return (
    <Badge 
      variant={config.variant}
      className={cn("font-medium border", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}