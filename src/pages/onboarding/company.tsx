import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { completeCompanyOnboarding } from "@/services/authService";
import { getPublicPlans, type PublicPlan } from "@/services/publicSiteService";

export default function CompanyOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState("");
    const [plans, setPlans] = useState < PublicPlan[] > ([]);
    const [formData, setFormData] = useState({ companyName: "", phone: "", planId: "", billingCycle: "monthly" });

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.replace("/login");
                return;
            }

            setFormData({
                companyName: typeof router.query.companyName === "string" ? router.query.companyName : "",
                phone: typeof router.query.phone === "string" ? router.query.phone : "",
                planId: typeof router.query.planId === "string" ? router.query.planId : "",
                billingCycle: typeof router.query.billingCycle === "string" ? router.query.billingCycle : "monthly",
            });

            getPublicPlans().then(setPlans).catch(() => setPlans([]));
            setCheckingAuth(false);
        };

        void load();
    }, [router]);

    const selectedPlan = useMemo(() => plans.find((plan) => plan.id === formData.planId) || null, [plans, formData.planId]);

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
                phone: formData.phone.trim() || undefined,
                planId: formData.planId || undefined,
                billingCycle: formData.billingCycle || "monthly",
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
            <SEO title="Complete Company Setup - WorkshopPro" description="Finish setting up your company and attach the selected subscription trial." />
            <div className="min-h-screen bg-background p-4">
                <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.85fr]">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg"><Building2 className="h-8 w-8" /></div>
                            </div>
                            <CardTitle className="text-3xl">Finish Company Setup</CardTitle>
                            <CardDescription>Add your workshop details so your dashboard and trial subscription are linked correctly.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                                <div className="space-y-2"><Label htmlFor="companyName">Company / Workshop Name *</Label><Input id="companyName" value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} required disabled={loading} /></div>
                                <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} disabled={loading} /></div>
                                <div className="space-y-2"><Label>Billing cycle after trial</Label><div className="rounded-xl border p-4 text-sm">{formData.billingCycle === "annual" ? "Annual" : "Monthly"}</div></div>
                                <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Company Setup...</> : "Create company and continue to dashboard"}</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trial summary</CardTitle>
                            <CardDescription>This is the subscription target that onboarding will try to attach to your company.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedPlan ? (
                                <div className="space-y-4">
                                    <div className="rounded-2xl border p-4">
                                        <div className="text-lg font-semibold">{selectedPlan.display_name}</div>
                                        <div className="text-sm text-muted-foreground">{selectedPlan.description || "Workshop SaaS plan"}</div>
                                        <div className="mt-4 text-3xl font-bold">${Number((formData.billingCycle === "annual" ? selectedPlan.price_annual : selectedPlan.price_monthly) || 0).toFixed(0)}<span className="text-base font-normal text-muted-foreground">/{formData.billingCycle === "annual" ? "year" : "month"}</span></div>
                                    </div>
                                    <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground space-y-2">
                                        <div className="flex items-center gap-2 text-foreground font-medium"><CheckCircle2 className="h-4 w-4 text-primary" /> Trial starts now</div>
                                        <div>• Your company record will be created</div>
                                        <div>• Your owner account will link to that company</div>
                                        <div>• A trial subscription row will be attached if the plan exists in your live catalog</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">No matching plan was selected. Onboarding will fall back to the default signup plan from platform settings.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
