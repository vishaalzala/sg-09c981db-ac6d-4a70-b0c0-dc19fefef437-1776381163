import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wrench, CheckCircle2, ArrowRight, Users, Building2, Receipt, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { getPublicPlans, type PublicPlan } from "@/services/publicSiteService";

const fallbackPlans: PublicPlan[] = [
  {
    id: "starter",
    name: "starter",
    display_name: "Starter",
    description: "For smaller workshops getting set up.",
    price_monthly: 99,
    price_annual: 990,
    max_users: 5,
    max_branches: 1,
    features: ["Jobs, quotes and invoices", "Customer and vehicle CRM", "Basic workshop reporting"],
  },
  {
    id: "growth",
    name: "growth",
    display_name: "Growth",
    description: "Best for growing workshops with multiple staff.",
    price_monthly: 249,
    price_annual: 2490,
    max_users: 15,
    max_branches: 3,
    features: ["Everything in Starter", "Advanced reporting", "Add-on ready architecture"],
  },
  {
    id: "pro",
    name: "pro",
    display_name: "Pro",
    description: "For multi-branch or advanced SaaS customers.",
    price_monthly: 499,
    price_annual: 4990,
    max_users: null,
    max_branches: null,
    features: ["Unlimited users", "Unlimited branches", "Priority support and API-ready setup"],
  },
];

export default function HomePage() {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublicPlans()
      .then((rows) => {
        if (!mounted) return;
        setPlans(rows.length ? rows : fallbackPlans);
      })
      .catch(() => {
        if (!mounted) return;
        setPlans(fallbackPlans);
      })
      .finally(() => {
        if (mounted) setLoadingPlans(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const featuredPlans = useMemo(() => (plans.length ? plans.slice(0, 3) : fallbackPlans), [plans]);

  return (
    <>
      <SEO
        title="WorkshopPro - Workshop SaaS for jobs, invoices, WOF and growth"
        description="WorkshopPro helps automotive workshops run jobs, quotes, invoices, reminders, WOF workflows and add-ons from one SaaS platform."
      />

      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <div className="rounded-xl bg-primary p-2 text-primary-foreground">
                <Wrench className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">WorkshopPro</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              <Link href="/addons" className="text-sm text-muted-foreground hover:text-foreground">Add-ons</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </header>

        <main>
          <section className="container mx-auto grid gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <Badge className="mb-4">Built for real workshop operations</Badge>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Run jobs, invoices, reminders, WOF workflows and future add-ons from one workshop SaaS.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                WorkshopPro is designed to give workshop owners, staff and future multi-branch operators one place to manage bookings, jobs, customers, vehicles, billing and add-on growth.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start free trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View plans</Link>
                </Button>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-muted-foreground">Core workflow</div>
                  <div className="mt-2 font-semibold">Jobs, quotes, invoices, customers, vehicles</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-muted-foreground">Growth-ready</div>
                  <div className="mt-2 font-semibold">WOF, marketing, websites, loyalty, future add-ons</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-sm text-muted-foreground">SaaS control</div>
                  <div className="mt-2 font-semibold">Plans, billing, communications and admin visibility</div>
                </div>
              </div>
            </div>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">What you get in the free trial</CardTitle>
                <CardDescription>Start on a real plan and complete workshop onboarding after signup.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Users, label: "Workshop CRM", text: "Customers, vehicles and staff records" },
                  { icon: Receipt, label: "Operational flow", text: "Jobs, quotes, invoices and reminders" },
                  { icon: Building2, label: "Business setup", text: "Company onboarding linked to your selected plan" },
                  { icon: ShieldCheck, label: "Growth path", text: "Add-ons and billing-ready structure as you scale" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 rounded-xl border p-4">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.text}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section className="container mx-auto px-6 pb-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">Plans built from your subscription catalog</h2>
                <p className="mt-2 text-muted-foreground">These cards use your active SaaS plans. If no active plans are returned, the page falls back safely.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/pricing">See full pricing</Link>
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {featuredPlans.map((plan, index) => (
                <Card key={plan.id} className={index === 1 ? "border-primary shadow-md" : ""}>
                  <CardHeader>
                    <CardTitle>{plan.display_name}</CardTitle>
                    <CardDescription>{plan.description || "Workshop SaaS plan"}</CardDescription>
                    <div className="pt-4 text-4xl font-bold">
                      ${Number(plan.price_monthly || 0).toFixed(0)}
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {plan.max_branches ? `${plan.max_branches} branch${plan.max_branches > 1 ? "es" : ""}` : "Unlimited branches"} · {plan.max_users ? `${plan.max_users} users` : "Unlimited users"}
                    </div>
                    <div className="space-y-2">
                      {plan.features.slice(0, 5).map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/signup?plan=${plan.id}&billingCycle=monthly`}>Choose {plan.display_name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {loadingPlans ? <div className="mt-4 text-sm text-muted-foreground">Loading live plan catalog...</div> : null}
          </section>
        </main>
      </div>
    </>
  );
}
