import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, Wrench, Users, Calendar, FileText, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  const features = [
    { icon: Users, title: "Customer Management", desc: "Complete CRM with vehicle tracking" },
    { icon: Calendar, title: "Smart Booking", desc: "Calendar and appointment management" },
    { icon: Wrench, title: "Job Workflow", desc: "From quote to payment in one system" },
    { icon: FileText, title: "Invoicing", desc: "Professional quotes and invoices" },
    { icon: Shield, title: "WOF Compliance", desc: "Full NZ WOF inspection system" },
    { icon: TrendingUp, title: "Analytics", desc: "Business insights and reporting" },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$99",
      features: ["1 Branch", "5 Users", "Basic Features", "Email Support"],
      cta: "Start Free Trial"
    },
    {
      name: "Growth",
      price: "$249",
      features: ["3 Branches", "15 Users", "Advanced Features", "Priority Support"],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Pro",
      price: "$499",
      features: ["Unlimited Branches", "Unlimited Users", "All Features", "Dedicated Support"],
      cta: "Contact Sales"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              <span className="text-2xl font-heading font-bold">WorkshopPro</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/features" className="text-muted-foreground hover:text-foreground transition">Features</Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link>
              <Link href="/addons" className="text-muted-foreground hover:text-foreground transition">Add-ons</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link>
              <Button variant="ghost" onClick={() => router.push("/login")}>Login</Button>
              <Button onClick={() => router.push("/login")}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="font-heading text-5xl lg:text-6xl font-bold mb-6">
            Complete Workshop Management<br />for NZ & Australia
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Manage customers, vehicles, jobs, quotes, invoices, WOF compliance, and more in one powerful platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-heading font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-heading font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Choose the plan that fits your workshop</p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card key={idx} className={plan.popular ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  {plan.popular && (
                    <div className="text-center mb-2">
                      <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-3xl font-heading text-center">{plan.name}</CardTitle>
                  <div className="text-center mt-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">Ready to Transform Your Workshop?</h2>
          <p className="text-xl mb-8 opacity-90">Join hundreds of workshops across New Zealand</p>
          <Button size="lg" variant="secondary" onClick={() => router.push("/login")}>
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-6 w-6 text-primary" />
                <span className="text-xl font-heading font-bold">WorkshopPro</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete workshop management for automotive professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/addons">Add-ons</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/about">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2026 WorkshopPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}