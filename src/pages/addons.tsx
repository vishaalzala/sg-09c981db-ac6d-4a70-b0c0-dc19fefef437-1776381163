import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Shield, Globe, TrendingUp, Gift, Check } from "lucide-react";

export default function AddonsPage() {
  const addons = [
    {
      icon: Shield,
      name: "WOF Compliance System",
      price: "$99/month",
      description: "Full NZ Transport Agency compliant WOF inspection system",
      features: [
        "Digital inspection checklists",
        "Pass/Fail/Recheck workflow",
        "Inspector certification tracking",
        "Equipment calibration logs",
        "Compliance reporting",
        "Auto-generate WOF certificates",
      ],
    },
    {
      icon: Globe,
      name: "Website Builder",
      price: "$29/month",
      description: "Professional workshop website with booking integration",
      features: [
        "Choose from 5+ templates",
        "Custom domain support",
        "Online booking form",
        "Lead capture",
        "Customer portal login",
        "Mobile responsive",
      ],
    },
    {
      icon: TrendingUp,
      name: "Marketing & Social",
      price: "$49/month",
      description: "Automated customer engagement and social media tools",
      features: [
        "Service reminder campaigns",
        "WOF reminder emails & SMS",
        "Social media post scheduler",
        "AI-powered content suggestions",
        "Customer segmentation",
        "Performance analytics",
      ],
    },
    {
      icon: Gift,
      name: "Loyalty Program",
      price: "$49/month",
      description: "Reward repeat customers and drive retention",
      features: [
        "Points-based rewards",
        "Discount codes",
        "Referral tracking",
        "Customer tiers",
        "Birthday rewards",
        "Redemption management",
      ],
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
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">Contact</Link>
              <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-heading font-bold mb-4">Powerful Add-ons</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Extend your workshop system with specialized features designed for growth
        </p>
      </section>

      {/* Add-ons Grid */}
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {addons.map((addon, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <addon.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{addon.name}</CardTitle>
                    <p className="text-xl font-bold text-primary mt-1">{addon.price}</p>
                  </div>
                </div>
                <CardDescription className="text-base">{addon.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {addon.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Add-ons can be enabled anytime from your account settings</p>
          <Button size="lg" asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}