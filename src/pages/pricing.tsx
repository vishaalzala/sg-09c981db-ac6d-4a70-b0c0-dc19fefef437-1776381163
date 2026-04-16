import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      features: [
        "1 Branch Location",
        "Up to 5 Users",
        "Unlimited Customers & Vehicles",
        "Jobs, Quotes & Invoices",
        "Basic Reporting",
        "Email Support",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Growth",
      price: "$249",
      period: "/month",
      features: [
        "Up to 3 Branches",
        "Up to 15 Users",
        "Everything in Starter",
        "Advanced Analytics",
        "Custom Branding",
        "Priority Support",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Pro",
      price: "$499",
      period: "/month",
      features: [
        "Unlimited Branches",
        "Unlimited Users",
        "Everything in Growth",
        "API Access",
        "Dedicated Account Manager",
        "24/7 Phone Support",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-heading font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose the plan that fits your workshop. No hidden fees. Cancel anytime.
        </p>
        <p className="text-sm text-muted-foreground">
          All plans include a <strong>14-day free trial</strong>. No credit card required.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <Card key={idx} className={plan.highlight ? "border-primary shadow-lg relative" : ""}>
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm px-4 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href="/login">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          Need a custom plan? <Link href="/contact" className="text-primary hover:underline">Contact our sales team</Link>
        </p>
      </section>
    </div>
  );
}