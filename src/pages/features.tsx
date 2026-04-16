import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ArrowLeft, Users, Calendar, Clipboard, FileText, CreditCard, Package, Shield, Globe, TrendingUp, Bell, Smartphone } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Users,
      title: "Customer & Vehicle Management",
      desc: "Complete CRM with customer profiles, vehicle history, and service records. Merge duplicates, track relationships, and manage fleet accounts."
    },
    {
      icon: Calendar,
      title: "Smart Booking System",
      desc: "Visual calendar, drag-and-drop scheduling, technician assignment, and courtesy vehicle management."
    },
    {
      icon: Clipboard,
      title: "Job Workflow",
      desc: "From quote to completion - track every step. Assign technicians, log labour, manage parts, and capture customer approvals."
    },
    {
      icon: FileText,
      title: "Quotes & Invoices",
      desc: "Professional documents with line items, discounts, and GST. Convert quotes to jobs or invoices seamlessly."
    },
    {
      icon: CreditCard,
      title: "Payment Management",
      desc: "Split payments across multiple methods, track fees, record deposits, and manage outstanding balances."
    },
    {
      icon: Package,
      title: "Inventory & Suppliers",
      desc: "Track stock levels, manage suppliers, create purchase orders, and monitor parts usage per job."
    },
    {
      icon: Shield,
      title: "WOF Compliance (Add-on)",
      desc: "Full NZ Transport Agency compliant inspection system. Digital checklists, pass/fail workflow, and certification tracking."
    },
    {
      icon: Globe,
      title: "Website Builder (Add-on)",
      desc: "Publish a professional workshop website with booking forms, service info, and customer portal access."
    },
    {
      icon: TrendingUp,
      title: "Business Analytics",
      desc: "Revenue reports, technician productivity, popular services, and customer retention insights."
    },
    {
      icon: Bell,
      title: "Automated Reminders",
      desc: "Service due, WOF expiry, rego reminders sent via SMS and email to keep customers returning."
    },
    {
      icon: Smartphone,
      title: "Mobile-Friendly",
      desc: "Responsive design for tablets and phones. Technicians can update jobs from the workshop floor."
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
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link>
              <Link href="/addons" className="text-muted-foreground hover:text-foreground transition">Add-ons</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link>
              <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-heading font-bold mb-4">Powerful Features for Modern Workshops</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to run your automotive workshop efficiently, professionally, and profitably.
        </p>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-3" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6 opacity-90">Try WorkshopPro free for 14 days</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}