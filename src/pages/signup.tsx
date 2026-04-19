import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, AlertTriangle, Loader2, Wrench } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // DEMO MODE: Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEMO MODE: Skip real signup and redirect
    if (isDemoMode) {
      console.log("🎭 DEMO MODE - Bypassing signup, redirecting to dashboard");
      router.push("/dashboard");
      return;
    }

    // PRODUCTION MODE: Real signup flow
    setLoading(true);
    setError("");

    try {
      if (!formData.companyName || !formData.ownerName || !formData.email || !formData.password) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!formData.agreeToTerms) {
        throw new Error("Please agree to the Terms of Service");
      }

      console.log("Creating trial account:", {
        email: formData.email,
        company: formData.companyName
      });

      const response = await fetch("/api/admin/create-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company: {
            name: formData.companyName,
            email: formData.email,
            phone: formData.phone || null,
            is_active: true
          },
          owner: {
            email: formData.email,
            password: formData.password,
            full_name: formData.ownerName
          },
          subscription: {
            planName: "free_trial",
            status: "trial_active",
            trialDays: 14
          },
          addons: [],
          branch: {
            name: `${formData.companyName} - Main Branch`,
            email: formData.email,
            phone: formData.phone || null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      console.log("Trial account created:", data.companyId);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error("Auto sign-in failed:", signInError);
        router.push("/login?message=Account created successfully. Please sign in.");
        return;
      }

      router.push("/dashboard");

    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // DEMO MODE: Show simplified signup with bypass notice
  if (isDemoMode) {
    return (
      <>
        <SEO 
          title="Demo Mode - WorkshopPro"
          description="Demo mode enabled - development access"
        />

        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                  <Wrench className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl">🎭 Demo Mode - Signup Bypassed</CardTitle>
              <CardDescription className="text-base">
                Real signup is disabled in demo mode. Click below to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Demo mode is enabled. No actual account will be created.
                </AlertDescription>
              </Alert>

              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => router.push("/dashboard")}
              >
                Continue to Dashboard
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // PRODUCTION MODE: Normal signup form
  return (
    <>
      <SEO 
        title="Start Your Free Trial - WorkshopPro"
        description="Get started with WorkshopPro today. 14-day free trial, no credit card required."
      />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <Wrench className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl">Start Your Free Trial</CardTitle>
            <CardDescription className="text-base">
              14 days free, no credit card required. Get full access to all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Workshop Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="e.g., Auckland Auto Service"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Your Name *</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  placeholder="e.g., John Smith"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+64 21 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Full access to all features</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  "Start Free Trial"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}