import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wrench, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { getPublicPlans, type PublicPlan } from "@/services/publicSiteService";

const fallbackPlans: PublicPlan[] = [
  { id: "starter", name: "starter", display_name: "Starter", description: "Essential workflow for smaller workshops.", price_monthly: 99, price_annual: 990, max_users: 5, max_branches: 1, features: ["Jobs, quotes and invoices", "Customer and vehicle CRM", "Basic reporting"] },
  { id: "growth", name: "growth", display_name: "Growth", description: "Balanced plan for growing teams.", price_monthly: 249, price_annual: 2490, max_users: 15, max_branches: 3, features: ["Everything in Starter", "Advanced workflow visibility", "Priority support"] },
  { id: "pro", name: "pro", display_name: "Pro", description: "Full platform control for larger operations.", price_monthly: 499, price_annual: 4990, max_users: null, max_branches: null, features: ["Unlimited users", "Unlimited branches", "API-ready foundation"] },
];

export default function PricingPage() {
  const [plans, setPlans] = useState<PublicPlan[]>(fallbackPlans);

  useEffect(() => {
    getPublicPlans().then((rows) => {
      if (rows.length) setPlans(rows);
    }).catch(() => undefined);
  }, []);

  const orderedPlans = useMemo(() => plans, [plans]);

  return (
    <>
      <SEO title="Pricing - WorkshopPro" description="Choose a WorkshopPro plan and start a free trial on the right subscription." />
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              <span className="text-2xl font-heading font-bold">WorkshopPro</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/features" className="text-muted-foreground hover:text-foreground transition">Features</Link>
              <Link href="/addons" className="text-muted-foreground hover:text-foreground transition">Add-ons</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link>
              <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            </div>
          </div>
        </nav>

        <section className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-heading font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your workshop today and keeps room for WOF, communications and future add-ons.
          </p>
          <p className="text-sm text-muted-foreground">
            All plans start with a <strong>14-day free trial</strong> and then continue on the billing cycle you choose.
          </p>
        </section>

        <section className="container mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {orderedPlans.map((plan, idx) => {
              const highlight = idx === 1;
              return (
                <Card key={plan.id} className={highlight ? "border-primary shadow-lg relative" : ""}>
                  {highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm px-4 py-1 rounded-full font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                    <CardDescription>{plan.description || "Workshop SaaS plan"}</CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">${Number(plan.price_monthly || 0).toFixed(0)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <div className="text-sm text-muted-foreground">or ${Number(plan.price_annual || 0).toFixed(0)}/year</div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center text-sm text-muted-foreground">
                      {plan.max_branches ? `${plan.max_branches} branch${plan.max_branches > 1 ? "es" : ""}` : "Unlimited branches"} · {plan.max_users ? `${plan.max_users} users` : "Unlimited users"}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={`${plan.id}-${i}`} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="grid gap-2">
                      <Button className="w-full" variant={highlight ? "default" : "outline"} asChild>
                        <Link href={`/signup?plan=${plan.id}&billingCycle=monthly`}>Start monthly trial</Link>
                      </Button>
                      <Button className="w-full" variant="ghost" asChild>
                        <Link href={`/signup?plan=${plan.id}&billingCycle=annual`}>Start annual trial</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-muted-foreground mt-12">
            Need a custom plan? <Link href="/contact" className="text-primary hover:underline">Contact our sales team</Link>
          </p>
        </section>
      </div>
    </>
  );
}
