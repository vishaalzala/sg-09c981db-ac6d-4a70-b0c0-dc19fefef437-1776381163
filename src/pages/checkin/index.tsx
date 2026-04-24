import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, User, Car, Wrench, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CheckInFormData = {
    name: string;
    mobile: string;
    phone: string;
    email: string;
    rego: string;
    service: string;
    issue: string;
    pickupTime: string;
    approvalLimit: string;
};

const emptyForm: CheckInFormData = {
    name: "",
    mobile: "",
    phone: "",
    email: "",
    rego: "",
    service: "",
    issue: "",
    pickupTime: "",
    approvalLimit: "",
};

export default function SmartCheckInPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState < CheckInFormData > (emptyForm);
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState < string > ("");

    const companyId = useMemo(() => {
        const value = router.query.companyId;
        return typeof value === "string" ? value : "";
    }, [router.query.companyId]);

    const updateField = (field: keyof CheckInFormData, value: string) => {
        setFormData((current) => ({
            ...current,
            [field]: field === "rego" ? value.toUpperCase() : value,
        }));
    };

    const resetForm = () => {
        setSubmitted(false);
        setStep(1);
        setFormData(emptyForm);
        setReferenceNumber("");
    };

    const handleNext = () => {
        setStep((current) => current + 1);
    };

    const handleSubmit = async () => {
        if (!companyId) {
            toast({
                title: "Missing workshop",
                description: "This check-in page needs a valid companyId in the URL.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.name.trim() || !formData.mobile.trim()) {
            toast({
                title: "Customer details required",
                description: "Please enter your name and mobile number.",
                variant: "destructive",
            });
            setStep(1);
            return;
        }

        if (!formData.rego.trim() || !formData.service.trim()) {
            toast({
                title: "Vehicle details required",
                description: "Please enter registration number and service required.",
                variant: "destructive",
            });
            setStep(2);
            return;
        }

        setSaving(true);

        try {
            const response = await fetch("/api/checkin/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyId,
                    name: formData.name.trim(),
                    mobile: formData.mobile.trim(),
                    phone: formData.phone.trim() || null,
                    email: formData.email.trim() || null,
                    rego: formData.rego.trim().toUpperCase(),
                    service: formData.service.trim(),
                    issue: formData.issue.trim() || null,
                    pickupTime: formData.pickupTime || null,
                    approvalLimit: formData.approvalLimit
                        ? Number(formData.approvalLimit)
                        : null,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.error || "Failed to check in vehicle.");
            }

            setReferenceNumber(result.jobNumber || result.jobId);
            setSubmitted(true);
        } catch (error: any) {
            toast({
                title: "Check-in failed",
                description: error?.message || "Please ask the workshop team for help.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (!router.isReady) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
                <Card className="w-full max-w-xl">
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Loading check-in...
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!companyId) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
                <Card className="w-full max-w-xl border-destructive/40">
                    <CardContent className="py-10 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                        <h1 className="font-heading text-2xl font-bold mb-2">
                            Workshop not found
                        </h1>
                        <p className="text-muted-foreground">
                            This check-in link is missing a companyId. Please ask the workshop
                            team for the correct check-in QR code or kiosk link.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl text-center border-success">
                    <CardContent className="pt-12 pb-12">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-success/10 rounded-full">
                                <CheckCircle className="h-20 w-20 text-success" />
                            </div>
                        </div>
                        <h1 className="font-heading text-4xl font-bold mb-4">
                            Thank you!
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Your vehicle has been checked in. We'll be with you shortly.
                        </p>
                        <p className="text-lg mb-8">
                            Reference:{" "}
                            <span className="font-mono font-bold">
                                {referenceNumber || "Created"}
                            </span>
                        </p>
                        <Button size="lg" onClick={resetForm}>
                            Check In Another Vehicle
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader className="bg-primary text-primary-foreground">
                    <div className="flex items-center gap-3">
                        <Wrench className="h-10 w-10" />
                        <div>
                            <CardTitle className="text-3xl">Vehicle Check-In</CardTitle>
                            <p className="text-sm opacity-90">WorkshopPro Smart Check-In</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-8 pb-8">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <User className="h-8 w-8 text-primary" />
                                <h2 className="font-heading text-2xl font-semibold">
                                    Your Details
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-lg">Name *</Label>
                                    <Input
                                        className="text-lg h-14 mt-2"
                                        placeholder="John Smith"
                                        value={formData.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg">Mobile *</Label>
                                    <Input
                                        className="text-lg h-14 mt-2"
                                        placeholder="021 123 4567"
                                        value={formData.mobile}
                                        onChange={(e) => updateField("mobile", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg">Phone</Label>
                                    <Input
                                        className="text-lg h-14 mt-2"
                                        placeholder="09 123 4567"
                                        value={formData.phone}
                                        onChange={(e) => updateField("phone", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg">Email</Label>
                                    <Input
                                        type="email"
                                        className="text-lg h-14 mt-2"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg"
                                onClick={handleNext}
                                disabled={!formData.name || !formData.mobile || saving}
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Car className="h-8 w-8 text-primary" />
                                <h2 className="font-heading text-2xl font-semibold">
                                    Vehicle Details
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-lg">Registration Number *</Label>
                                    <Input
                                        className="text-lg h-14 mt-2"
                                        placeholder="ABC123"
                                        value={formData.rego}
                                        onChange={(e) => updateField("rego", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg">Service Required *</Label>
                                    <Input
                                        className="text-lg h-14 mt-2"
                                        placeholder="e.g., WOF, Service, Repair"
                                        value={formData.service}
                                        onChange={(e) => updateField("service", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg">Describe the Issue</Label>
                                    <Textarea
                                        className="text-lg mt-2"
                                        rows={4}
                                        placeholder="Tell us what's wrong with your vehicle..."
                                        value={formData.issue}
                                        onChange={(e) => updateField("issue", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 h-14 text-lg"
                                    onClick={() => setStep(1)}
                                    disabled={saving}
                                >
                                    Back
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 text-lg"
                                    onClick={handleNext}
                                    disabled={!formData.rego || !formData.service || saving}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Wrench className="h-8 w-8 text-primary" />
                                <h2 className="font-heading text-2xl font-semibold">
                                    Service Preferences
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-lg">Pick Up Time</Label>
                                    <Input
                                        type="time"
                                        className="text-lg h-14 mt-2"
                                        value={formData.pickupTime}
                                        onChange={(e) => updateField("pickupTime", e.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <Label className="text-lg">Approval Limit (Optional)</Label>
                                    <Input
                                        type="number"
                                        className="text-lg h-14 mt-2"
                                        placeholder="500"
                                        value={formData.approvalLimit}
                                        onChange={(e) =>
                                            updateField("approvalLimit", e.target.value)
                                        }
                                        disabled={saving}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Maximum amount you approve for work without calling
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted p-6 rounded-lg space-y-3">
                                <h3 className="font-semibold text-lg">Summary</h3>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mobile:</span>
                                        <span className="font-medium">{formData.mobile}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Registration:</span>
                                        <span className="font-medium">{formData.rego}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Service:</span>
                                        <span className="font-medium">{formData.service}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 h-14 text-lg"
                                    onClick={() => setStep(2)}
                                    disabled={saving}
                                >
                                    Back
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 text-lg"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                >
                                    {saving ? "Checking In..." : "Check In"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}