import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Plus, AlertCircle, CheckCircle, Clock, Shield } from "lucide-react";
import { FeatureGate } from "@/components/FeatureGate";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { companyService } from "@/services/companyService";
import { wofService } from "@/services/wofService";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

export default function WofPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [hasWofAccess, setHasWofAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inspections, setInspections] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const access = await companyService.checkFeatureEntitlement(company.id, "wof_compliance");
      setHasWofAccess(access);

      if (access) {
        const [inspData, certData, equipData] = await Promise.all([
          wofService.getInspections(company.id),
          wofService.getInspectorCertifications(company.id),
          wofService.getEquipment(company.id),
        ]);
        setInspections(inspData);
        setCertifications(certData);
        setEquipment(equipData);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const pendingInspections = inspections.filter(i => i.result === "pending" || !i.result);
  const failedInspections = inspections.filter(i => i.result === "fail");
  const passedInspections = inspections.filter(i => i.result === "pass");
  const expiringCertifications = certifications.filter(c => {
    const daysToExpiry = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysToExpiry <= 60 && daysToExpiry > 0;
  });

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="WOF Inspector">
      <FeatureGate feature="wof_compliance" isEnabled={hasWofAccess}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">WOF Compliance</h1>
              <p className="text-muted-foreground mt-1">
                Warrant of Fitness inspections and compliance
              </p>
            </div>
            <Button onClick={() => window.location.href = "/wof/new"}>
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingInspections.length}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{failedInspections.length}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{passedInspections.length}</p>
                    <p className="text-xs text-muted-foreground">Passed This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Shield className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{expiringCertifications.length}</p>
                    <p className="text-xs text-muted-foreground">Expiring Certifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="inspections" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inspections">Inspections</TabsTrigger>
              <TabsTrigger value="certifications">Inspector Certifications</TabsTrigger>
              <TabsTrigger value="equipment">Equipment & Calibration</TabsTrigger>
            </TabsList>

            <TabsContent value="inspections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>WOF Inspections</CardTitle>
                  <CardDescription>Manage vehicle inspections</CardDescription>
                </CardHeader>
                <CardContent>
                  {inspections.length === 0 ? (
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No inspections"
                      description="Create your first WOF inspection"
                      action={{
                        label: "New Inspection",
                        onClick: () => window.location.href = "/wof/new",
                      }}
                    />
                  ) : (
                    <div className="space-y-3">
                      {inspections.map((inspection) => {
                        const customer = Array.isArray(inspection.customer) ? inspection.customer[0] : inspection.customer;
                        const vehicle = Array.isArray(inspection.vehicle) ? inspection.vehicle[0] : inspection.vehicle;
                        const inspector = Array.isArray(inspection.inspector) ? inspection.inspector[0] : inspection.inspector;

                        return (
                          <div
                            key={inspection.id}
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/wof/${inspection.id}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{vehicle?.registration_number}</span>
                                  <StatusBadge type="wof" status={inspection.result || "pending"} />
                                </div>

                                <p className="text-sm">{customer?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle?.make} {vehicle?.model}
                                </p>

                                {inspector && (
                                  <p className="text-xs text-muted-foreground">
                                    Inspector: {inspector.full_name}
                                  </p>
                                )}
                              </div>

                              <div className="text-right space-y-1">
                                <p className="text-sm font-medium">
                                  {new Date(inspection.inspection_date).toLocaleDateString()}
                                </p>
                                {inspection.result && (
                                  <Badge variant={inspection.result === "pass" ? "outline" : "destructive"}>
                                    {inspection.result.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inspector Certifications</CardTitle>
                  <CardDescription>Track certification status and expiry dates</CardDescription>
                </CardHeader>
                <CardContent>
                  {certifications.length === 0 ? (
                    <EmptyState
                      icon={Shield}
                      title="No certifications"
                      description="Add inspector certifications"
                    />
                  ) : (
                    <div className="space-y-3">
                      {certifications.map((cert) => {
                        const inspector = Array.isArray(cert.inspector) ? cert.inspector[0] : cert.inspector;
                        const daysToExpiry = Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const isExpiring = daysToExpiry <= 60 && daysToExpiry > 0;
                        const isExpired = daysToExpiry <= 0;

                        return (
                          <div key={cert.id} className={cn(
                            "p-4 border rounded-lg",
                            isExpired && "border-destructive/50 bg-destructive/5",
                            isExpiring && !isExpired && "border-warning/50 bg-warning/5"
                          )}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <p className="font-semibold">{inspector?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{cert.certification_type}</p>
                                <p className="text-sm">Cert No: {cert.certification_number}</p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="text-sm">
                                  Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                                </p>
                                {isExpired ? (
                                  <Badge variant="destructive">Expired</Badge>
                                ) : isExpiring ? (
                                  <Badge variant="outline" className="text-warning border-warning">
                                    {daysToExpiry} days left
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-success border-success">
                                    Valid
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inspection Equipment</CardTitle>
                  <CardDescription>Track equipment calibration and maintenance</CardDescription>
                </CardHeader>
                <CardContent>
                  {equipment.length === 0 ? (
                    <EmptyState
                      icon={ClipboardCheck}
                      title="No equipment"
                      description="Add inspection equipment"
                    />
                  ) : (
                    <div className="space-y-3">
                      {equipment.map((item) => {
                        const latestCalibration = Array.isArray(item.calibrations) && item.calibrations.length > 0
                          ? item.calibrations[0]
                          : null;
                        const nextDue = latestCalibration?.next_calibration_date;
                        const daysToCalibration = nextDue
                          ? Math.ceil((new Date(nextDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                          : null;
                        const isDue = daysToCalibration !== null && daysToCalibration <= 30;

                        return (
                          <div key={item.id} className={cn(
                            "p-4 border rounded-lg",
                            isDue && "border-warning/50 bg-warning/5"
                          )}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <p className="font-semibold">{item.equipment_name}</p>
                                <p className="text-sm text-muted-foreground">{item.equipment_type}</p>
                                <p className="text-sm">Serial: {item.serial_number}</p>
                              </div>
                              <div className="text-right space-y-1">
                                {nextDue ? (
                                  <>
                                    <p className="text-sm">
                                      Next Cal: {new Date(nextDue).toLocaleDateString()}
                                    </p>
                                    {isDue && (
                                      <Badge variant="outline" className="text-warning border-warning">
                                        Calibration Due
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No calibration scheduled</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </FeatureGate>
    </AppLayout>
  );
}