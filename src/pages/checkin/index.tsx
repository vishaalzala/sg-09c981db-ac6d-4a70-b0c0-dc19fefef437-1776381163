import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, User, Car, Wrench } from "lucide-react";

export default function SmartCheckInPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    phone: "",
    email: "",
    rego: "",
    service: "",
    issue: "",
    pickupTime: "",
    approvalLimit: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

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
            <h1 className="font-heading text-4xl font-bold mb-4">Thank you!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your vehicle has been checked in. We'll be with you shortly.
            </p>
            <p className="text-lg mb-8">
              Reference: <span className="font-mono font-bold">CHK-{Date.now().toString().slice(-6)}</span>
            </p>
            <Button size="lg" onClick={() => { setSubmitted(false); setStep(1); setFormData({ name: "", mobile: "", phone: "", email: "", rego: "", service: "", issue: "", pickupTime: "", approvalLimit: "" }); }}>
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
              <p className="text-sm opacity-90">AutoTech Workshop</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-8 w-8 text-primary" />
                <h2 className="font-heading text-2xl font-semibold">Your Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-lg">Name *</Label>
                  <Input
                    className="text-lg h-14 mt-2"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-lg">Mobile *</Label>
                  <Input
                    className="text-lg h-14 mt-2"
                    placeholder="021 123 4567"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-lg">Phone</Label>
                  <Input
                    className="text-lg h-14 mt-2"
                    placeholder="09 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-lg">Email</Label>
                  <Input
                    type="email"
                    className="text-lg h-14 mt-2"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleNext}
                disabled={!formData.name || !formData.mobile}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Car className="h-8 w-8 text-primary" />
                <h2 className="font-heading text-2xl font-semibold">Vehicle Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-lg">Registration Number *</Label>
                  <Input
                    className="text-lg h-14 mt-2"
                    placeholder="ABC123"
                    value={formData.rego}
                    onChange={(e) => setFormData({ ...formData, rego: e.target.value.toUpperCase() })}
                  />
                </div>

                <div>
                  <Label className="text-lg">Service Required *</Label>
                  <Input
                    className="text-lg h-14 mt-2"
                    placeholder="e.g., WOF, Service, Repair"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-lg">Describe the Issue</Label>
                  <Textarea
                    className="text-lg mt-2"
                    rows={4}
                    placeholder="Tell us what's wrong with your vehicle..."
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1 h-14 text-lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg"
                  onClick={handleNext}
                  disabled={!formData.rego || !formData.service}
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
                <h2 className="font-heading text-2xl font-semibold">Service Preferences</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-lg">Pick Up Time</Label>
                  <Input
                    type="time"
                    className="text-lg h-14 mt-2"
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-lg">Approval Limit (Optional)</Label>
                  <Input
                    type="number"
                    className="text-lg h-14 mt-2"
                    placeholder="500"
                    value={formData.approvalLimit}
                    onChange={(e) => setFormData({ ...formData, approvalLimit: e.target.value })}
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
                <Button variant="outline" size="lg" className="flex-1 h-14 text-lg" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="lg" className="flex-1 h-14 text-lg" onClick={handleSubmit}>
                  Check In
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}