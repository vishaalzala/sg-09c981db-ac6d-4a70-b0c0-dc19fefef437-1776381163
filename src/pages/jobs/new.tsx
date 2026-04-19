import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerSelector } from "@/components/CustomerSelector";
import { VehicleSelector } from "@/components/VehicleSelector";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

export default function NewJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [jobNumber, setJobNumber] = useState("");
  const [jobDate, setJobDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("booked");
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!selectedCustomer) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Job created successfully" });
    router.push("/jobs");
  };

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">New Job</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/jobs")}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Job</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Customer Section */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Customer *</Label>
                  <CustomerSelector
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    companyId={companyId}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Section */}
            {selectedCustomer && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>Vehicle</Label>
                    <VehicleSelector
                      value={selectedVehicle}
                      onChange={setSelectedVehicle}
                      customerId={selectedCustomer?.id}
                      companyId={companyId}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Details */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job Number</Label>
                    <Input
                      value={jobNumber}
                      onChange={(e) => setJobNumber(e.target.value)}
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <Label>Job Date</Label>
                    <Input
                      type="date"
                      value={jobDate}
                      onChange={(e) => setJobDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                        <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Job Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this job..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Job Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <span className="capitalize">{priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{jobDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}