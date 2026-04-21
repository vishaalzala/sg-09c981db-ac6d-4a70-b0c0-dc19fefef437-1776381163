import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { completeCompanyOnboarding } from "@/services/authService";

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    phone: ""
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }

      setFormData({
        companyName: typeof router.query.companyName === "string" ? router.query.companyName : "",
        phone: typeof router.query.phone === "string" ? router.query.phone : ""
      });
      setCheckingAuth(false);
    };

    void load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.companyName.trim()) {
        throw new Error("Company name is required.");
      }

      await completeCompanyOnboarding({
        companyName: formData.companyName.trim(),
        phone: formData.phone.trim() || undefined
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Company onboarding error:", err);
      setError(err instanceof Error ? err.message : "Unable to complete company setup.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-10 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading company setup...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Complete Company Setup - WorkshopPro"
        description="Finish setting up your company to enter the WorkshopPro dashboard"
      />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <Building2 className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl">Finish Company Setup</CardTitle>
            <CardDescription>
              Add your workshop details so your dashboard can be linked to the right company.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="companyName">Company / Workshop Name *</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  placeholder="AutoTech Workshop Ltd"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="021 123 4567"
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Company Setup...
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
