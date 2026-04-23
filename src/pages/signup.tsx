import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signUp } from "@/services/authService";
import { getPublicPlans, type PublicPlan } from "@/services/publicSiteService";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";

const fallbackPlans: PublicPlan[] = [
  { id: "starter", name: "starter", display_name: "Starter", description: "Essential workshop setup", price_monthly: 99, price_annual: 990, max_users: 5, max_branches: 1, features: ["Jobs, quotes and invoices"] },
  { id: "growth", name: "growth", display_name: "Growth", description: "Best for growing teams", price_monthly: 249, price_annual: 2490, max_users: 15, max_branches: 3, features: ["Advanced reporting"] },
];

export default function SignupPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PublicPlan[]>(fallbackPlans);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    billingCycle: "monthly",
    selectedPlanId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getPublicPlans().then((rows) => {
      const resolved = rows.length ? rows : fallbackPlans;
      setPlans(resolved);
      setForm((prev) => ({
        ...prev,
        selectedPlanId: prev.selectedPlanId || (typeof router.query.plan === "string" ? router.query.plan : resolved[0]?.id || ""),
        billingCycle: typeof router.query.billingCycle === "string" ? router.query.billingCycle : prev.billingCycle,
      }));
    }).catch(() => {
      setPlans(fallbackPlans);
      setForm((prev) => ({
        ...prev,
        selectedPlanId: prev.selectedPlanId || (typeof router.query.plan === "string" ? router.query.plan : fallbackPlans[0].id),
      }));
    });
  }, [router.query.plan, router.query.billingCycle]);

  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === form.selectedPlanId) || plans[0], [plans, form.selectedPlanId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.companyName.trim()) return "Company name is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!form.selectedPlanId) return "Please select a plan.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        companyName: form.companyName.trim(),
        phone: form.phone.trim(),
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      const onboardingUrl = `/onboarding/company?companyName=${encodeURIComponent(form.companyName.trim())}&phone=${encodeURIComponent(form.phone.trim())}&planId=${encodeURIComponent(form.selectedPlanId)}&billingCycle=${encodeURIComponent(form.billingCycle)}`;

      if (result.requiresEmailConfirmation) {
        setSuccess("Account created. Confirm your email, then sign in to continue onboarding on your chosen plan.");
        return;
      }

      setSuccess("Account created successfully. Redirecting to company onboarding...");
      router.push(onboardingUrl);
    } catch (err: any) {
      console.error("Signup page error:", err);
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Start your free trial - WorkshopPro" description="Create your WorkshopPro account, choose a plan, and continue into company onboarding." />
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Start your WorkshopPro free trial</CardTitle>
              <CardDescription>Create the owner account now, then finish company onboarding on your selected plan.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
                {success ? <Alert><CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="fullName">Full name</Label><Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="companyName">Company name</Label><Input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={form.phone} onChange={handleChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required /></div>
                  <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm password</Label><Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required /></div>
                </div>
                <div className="space-y-3 pt-2">
                  <Label>Billing cycle after trial</Label>
                  <RadioGroup value={form.billingCycle} onValueChange={(value) => setForm((prev) => ({ ...prev, billingCycle: value }))} className="grid gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4"><RadioGroupItem value="monthly" id="billing-monthly" /><div><div className="font-medium">Monthly</div><div className="text-sm text-muted-foreground">Flexible month-to-month billing.</div></div></label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4"><RadioGroupItem value="annual" id="billing-annual" /><div><div className="font-medium">Annual</div><div className="text-sm text-muted-foreground">Lower effective cost for committed customers.</div></div></label>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create account and continue"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link></p>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your selected plan</CardTitle>
              <CardDescription>Pick the plan that should be attached to the trial created during onboarding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plans.map((plan) => (
                  <button key={plan.id} type="button" onClick={() => setForm((prev) => ({ ...prev, selectedPlanId: plan.id }))} className={`w-full rounded-xl border p-4 text-left transition ${form.selectedPlanId === plan.id ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold">{plan.display_name}</div>
                        <div className="text-sm text-muted-foreground">{plan.description || "Workshop SaaS plan"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">${Number((form.billingCycle === "annual" ? plan.price_annual : plan.price_monthly) || 0).toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">/{form.billingCycle === "annual" ? "year" : "month"}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {selectedPlan ? (
                <div className="rounded-xl bg-muted p-4 text-sm">
                  <div className="font-medium">Included in {selectedPlan.display_name}</div>
                  <div className="mt-2 space-y-2 text-muted-foreground">
                    {selectedPlan.features.slice(0, 6).map((feature) => <div key={feature}>• {feature}</div>)}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
