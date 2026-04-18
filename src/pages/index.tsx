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
    <>
      <SEO 
        title="WorkshopPro - Complete Workshop Management System"
        description="All-in-one automotive workshop management solution for New Zealand and Australia. CRM, Jobs, Invoicing, WOF, and more."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-semibold text-primary">✨ 14 Day FREE Trial - No Credit Card Required</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                Complete Workshop Management
                <span className="block text-primary mt-2">Built for NZ & Australia</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                All-in-one platform for automotive workshops. CRM, bookings, jobs, quotes, invoices, WOF compliance, and customer portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Start Free Trial
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    View Features
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                14 days free • Full access to all features • No credit card needed
              </p>
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
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-primary to-accent p-12 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Workshop?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Start your 14-day free trial today. No credit card required.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Start Free Trial Now
                </Button>
              </Link>
              <p className="mt-4 text-sm text-white/80">
                Full access • Cancel anytime • No contracts
              </p>
            </div>
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
    </>
  );
}