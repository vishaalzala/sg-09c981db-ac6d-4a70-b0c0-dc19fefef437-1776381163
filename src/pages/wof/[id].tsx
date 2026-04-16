import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { wofService } from "@/services/wofService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DocumentModal } from "@/components/DocumentModal";
import { TyreTreadDepth, BrakesPerformance, PassFailNA } from "@/components/wof/WofDesignElements";
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle, Printer, Mail, Ban, RotateCcw, Lock, Unlock } from "lucide-react";

export default function WofInspectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<any>(null);
  const [companyId, setCompanyId] = useState("");
  
  // Authorization Information (always editable, even after PASS)
  const [authInfo, setAuthInfo] = useState({
    wof_label_serial: "",
    system_auth_number: ""
  });
  
  // VOID dialog
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);
  
  // RECHECK flow
  const [isRecheckMode, setIsRecheckMode] = useState(false);
  
  // Document modal
  const [showDocModal, setShowDocModal] = useState(false);
  
  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    if (typeof id === "string") {
      const data = await wofService.getInspection(id);
      setInspection(data);
      setAuthInfo({
        wof_label_serial: (data as any).wof_label_serial || "",
        system_auth_number: (data as any).system_auth_number || ""
      });
    }
    setLoading(false);
  };

  const handleSubmitPass = async () => {
    if (!inspection) return;
    
    try {
      await wofService.updateInspection(inspection.id, {
        status: "passed",
        completed_at: new Date().toISOString()
      } as any);
      
      // Log compliance event
      await wofService.logCompliance({
        company_id: companyId,
        inspection_id: inspection.id,
        event_type: "inspection_passed",
        event_data: { status: "passed", completed_at: new Date().toISOString() },
        performed_by: "current_user_id"
      });
      
      toast({ title: "Inspection Passed", description: "WOF inspection marked as PASS. Form is now locked." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmitFail = async () => {
    if (!inspection) return;
    
    try {
      await wofService.updateInspection(inspection.id, {
        status: "failed",
        completed_at: new Date().toISOString()
      } as any);
      
      await wofService.logCompliance({
        company_id: companyId,
        inspection_id: inspection.id,
        event_type: "inspection_failed",
        event_data: { status: "failed", completed_at: new Date().toISOString() },
        performed_by: "current_user_id"
      });
      
      toast({ title: "Inspection Failed", description: "WOF inspection marked as FAIL. Customer will need repairs." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveAuthInfo = async () => {
    if (!inspection) return;
    
    try {
      await wofService.updateInspection(inspection.id, {
        wof_label_serial: authInfo.wof_label_serial,
        system_auth_number: authInfo.system_auth_number
      } as any);
      
      await wofService.logCompliance({
        company_id: companyId,
        inspection_id: inspection.id,
        event_type: "auth_info_updated",
        event_data: authInfo,
        performed_by: "current_user_id"
      });
      
      toast({ title: "Authorization Info Saved", description: "WOF authorization details updated successfully." });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleVoid = async () => {
    if (!voidReason.trim()) {
      toast({ title: "Reason Required", description: "Please provide a reason for voiding this inspection.", variant: "destructive" });
      return;
    }
    
    setVoiding(true);
    try {
      await wofService.updateInspection(inspection.id, {
        status: "voided",
        notes: `VOIDED: ${voidReason}\n\n${inspection.notes || ""}`
      } as any);
      
      await wofService.logCompliance({
        company_id: companyId,
        inspection_id: inspection.id,
        event_type: "inspection_voided",
        event_data: { reason: voidReason },
        performed_by: "current_user_id"
      });
      
      toast({ title: "Inspection Voided", description: "This WOF inspection has been permanently voided." });
      setShowVoidDialog(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setVoiding(false);
  };

  const handleStartRecheck = async () => {
    try {
      const recheck = await wofService.createRecheck({
        original_inspection_id: inspection.id,
        notes: "Recheck after repairs"
      } as any);
      
      toast({ title: "Recheck Started", description: "New recheck inspection created. You can now edit all fields." });
      router.push(`/wof/${recheck.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!inspection) return <div>Inspection not found</div>;

  const isPassed = inspection.status === "passed" || inspection.status === "pass";
  const isFailed = inspection.status === "failed" || inspection.status === "fail";
  const isVoided = inspection.status === "voided";
  const isLocked = isPassed || isVoided;

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="WOF Inspector">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold">WOF Inspection</h1>
              <p className="text-muted-foreground">
                {(inspection as any).registration_number || "Unknown Vehicle"} • {new Date(inspection.inspection_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isPassed && (
              <Badge className="bg-green-500 text-white text-base px-4 py-1.5">
                <CheckCircle className="h-4 w-4 mr-2" />
                PASSED
              </Badge>
            )}
            {isFailed && (
              <Badge variant="destructive" className="text-base px-4 py-1.5">
                <XCircle className="h-4 w-4 mr-2" />
                FAILED
              </Badge>
            )}
            {isVoided && (
              <Badge variant="outline" className="border-red-500 text-red-500 text-base px-4 py-1.5">
                <Ban className="h-4 w-4 mr-2" />
                VOIDED
              </Badge>
            )}
          </div>
        </div>

        {/* Status Alert */}
        {isLocked && (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              {isPassed && "This inspection has PASSED. The checklist is now locked. You can only edit Authorization Information or VOID this inspection."}
              {isVoided && "This inspection has been VOIDED and cannot be edited."}
            </AlertDescription>
          </Alert>
        )}

        {isFailed && !isRecheckMode && (
          <Alert className="border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription>
              This inspection has FAILED. The customer needs repairs before a RECHECK can be performed.
            </AlertDescription>
          </Alert>
        )}

        {/* Vehicle & Inspector Details */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Inspector Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Registration Number</Label>
                <Input value={(inspection as any).registration_number || ""} disabled />
              </div>
              <div>
                <Label>Customer</Label>
                <Input value={(inspection as any).customer_name || ""} disabled />
              </div>
              <div>
                <Label>Odometer (km)</Label>
                <Input value={(inspection as any).odometer_reading || ""} disabled />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Inspection Date</Label>
                <Input type="date" value={inspection.inspection_date.split("T")[0]} disabled />
              </div>
              <div>
                <Label>Inspector</Label>
                <Input value={(inspection as any).inspector_name || "Assigned Inspector"} disabled />
              </div>
              <div>
                <Label>Vehicle Details</Label>
                <Input value={(inspection as any).vehicle_details || "2019 Toyota Corolla GX"} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authorization Information - ALWAYS EDITABLE (even after PASS) */}
        <Card className={isPassed ? "border-2 border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Authorization Information</CardTitle>
              {isPassed && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Unlock className="h-3 w-3 mr-1" />
                  Editable
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm">
                This section can be filled in later and edited even after the inspection is marked as PASS. It is not required to submit the inspection result.
              </AlertDescription>
            </Alert>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>WOF Label Serial Number</Label>
                <Input 
                  value={authInfo.wof_label_serial}
                  onChange={e => setAuthInfo({ ...authInfo, wof_label_serial: e.target.value })}
                  placeholder="WOF LABEL SERIAL NUMBER"
                  disabled={isVoided}
                />
              </div>
              <div>
                <Label>System Authorization Number</Label>
                <Input 
                  value={authInfo.system_auth_number}
                  onChange={e => setAuthInfo({ ...authInfo, system_auth_number: e.target.value })}
                  placeholder="SYSTEM AUTHORIZATION NUMBER"
                  disabled={isVoided}
                />
              </div>
            </div>
            
            {!isVoided && (
              <Button onClick={handleSaveAuthInfo} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Authorization Info
              </Button>
            )}
          </CardContent>
        </Card>

        {/* WOF Checklist - LOCKED if PASSED or VOIDED */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inspection Checklist</CardTitle>
              {isLocked && (
                <Badge variant="secondary" className="text-slate-600">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Tyres & Wheels - Use exact design from reference */}
            <TyreTreadDepth />
            
            {/* Brakes - Use exact design from reference */}
            <BrakesPerformance />
            
            {/* Other inspection items would go here */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">
                Additional inspection sections (Lights, Steering, Suspension, etc.) would be implemented here following the same Pass/Fail/N/A pattern.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Inspector Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              rows={4} 
              value={inspection.notes || ""}
              disabled={isLocked}
              placeholder="Additional notes or observations..."
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pb-12">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDocModal(true)}>
              <Printer className="h-4 w-4 mr-2" />
              Print / Email
            </Button>
            
            {isPassed && !isVoided && (
              <Button variant="destructive" onClick={() => setShowVoidDialog(true)}>
                <Ban className="h-4 w-4 mr-2" />
                VOID Inspection
              </Button>
            )}
            
            {isFailed && !isVoided && (
              <Button variant="outline" onClick={handleStartRecheck}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Recheck
              </Button>
            )}
          </div>

          {!isPassed && !isFailed && !isVoided && (
            <div className="flex gap-3">
              <Button 
                variant="destructive" 
                size="lg"
                onClick={handleSubmitFail}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Submit as FAIL
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600" 
                size="lg"
                onClick={handleSubmitPass}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit as PASS
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* VOID Confirmation Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>VOID This Inspection?</DialogTitle>
            <DialogDescription>
              This action is permanent and will mark this WOF inspection as VOIDED. A reason is required for audit purposes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Reason for Voiding *</Label>
              <Textarea 
                rows={4}
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="e.g., Incorrect vehicle details, duplicate inspection, customer request..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(false)} disabled={voiding}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleVoid} disabled={voiding || !voidReason.trim()}>
              {voiding ? "Voiding..." : "VOID Inspection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Modal */}
      <DocumentModal 
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        title={`WOF Inspection - ${(inspection as any).registration_number}`}
        type="wof"
        entityId={inspection.id}
        customerEmail={(inspection as any).customer_email}
      />
    </AppLayout>
  );
}