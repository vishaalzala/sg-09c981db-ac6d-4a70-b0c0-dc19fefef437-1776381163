import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight, 
  Wrench, 
  Users, 
  Calendar, 
  FileText, 
  Shield, 
  TrendingUp,
  Zap,
  Cloud,
  Clock,
  BarChart3,
  DollarSign,
  Smartphone,
  Globe,
  Lock,
  Headphones,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const keyBenefits = [
    {
      icon: Cloud,
      title: "Cloud-Based Access",
      description: "Access your workshop data anywhere, anytime, on any device. No installation required."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Quick auto-complete, smart suggestions, and seamless workflow to save you time."
    },
    {
      icon: Lock,
      title: "Secure & Reliable",
      description: "Bank-level security with automatic backups. Your data is always safe and recoverable."
    }
  ];

  const features = [
    { 
      icon: Calendar, 
      title: "Smart Booking System", 
      desc: "Drag-and-drop calendar with automatic reminders via email & SMS"
    },
    { 
      icon: Wrench, 
      title: "Complete Job Management", 
      desc: "Track jobs from quote to payment with real-time updates"
    },
    { 
      icon: FileText, 
      title: "Professional Invoicing", 
      desc: "Create quotes and invoices in seconds with customizable templates"
    },
    { 
      icon: Users, 
      title: "Customer Management", 
      desc: "Complete vehicle history, service reminders, and customer portal"
    },
    { 
      icon: BarChart3, 
      title: "Stock Control", 
      desc: "Real-time inventory tracking with low stock alerts and barcode support"
    },
    { 
      icon: Shield, 
      title: "WOF Compliance (NZ)", 
      desc: "NZTA-approved digital inspection checksheets with instant email delivery"
    },
    { 
      icon: TrendingUp, 
      title: "Business Reports", 
      desc: "Sales, expenses, staff performance, and profit tracking dashboards"
    },
    { 
      icon: Smartphone, 
      title: "Mobile Ready", 
      desc: "Tablet mode for check-ins and inspections on the workshop floor"
    },
    { 
      icon: DollarSign, 
      title: "Payment Tracking", 
      desc: "Track payments, partial payments, and outstanding invoices"
    },
  ];

  const whyChooseUs = [
    {
      title: "Built for Workshops",
      points: [
        "Designed specifically for automotive workshops",
        "Covers every aspect from booking to billing",
        "Used by 100+ workshops across NZ & Australia"
      ]
    },
    {
      title: "Save Time & Money",
      points: [
        "Reduce admin time by up to 5 hours per week",
        "Eliminate double data entry with smart automation",
        "No expensive hardware or IT setup required"
      ]
    },
    {
      title: "Grow Your Business",
      points: [
        "Automated service reminders bring customers back",
        "Professional quotes and invoices boost conversions",
        "Customer portal improves satisfaction and retention"
      ]
    }
  ];

  const suitableFor = [
    { name: "Auto Service Centres", icon: "🚗" },
    { name: "Tyre & Wheel Shops", icon: "🛞" },
    { name: "WOF Inspection Stations", icon: "✅" },
    { name: "Truck & Fleet Services", icon: "🚛" },
    { name: "Marine Workshops", icon: "⚓" },
    { name: "Motorcycle Shops", icon: "🏍️" }
  ];

  return (
    <>
      <SEO 
        title="WorkshopPro - Complete Workshop Management System for NZ & Australia"
        description="Cloud-based workshop management software for automotive businesses. Bookings, jobs, invoicing, WOF compliance, inventory, and more. 14-day free trial."
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl">WorkshopPro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/addons" className="text-sm font-medium hover:text-primary transition-colors">
                Add-ons
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Start Free Trial</Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t">
              <div className="container py-4 space-y-3">
                <Link href="/features" className="block py-2 text-sm font-medium hover:text-primary">
                  Features
                </Link>
                <Link href="/pricing" className="block py-2 text-sm font-medium hover:text-primary">
                  Pricing
                </Link>
                <Link href="/addons" className="block py-2 text-sm font-medium hover:text-primary">
                  Add-ons
                </Link>
                <Link href="/contact" className="block py-2 text-sm font-medium hover:text-primary">
                  Contact
                </Link>
                <div className="pt-2 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button size="sm" className="w-full">Start Free Trial</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="container py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-block">
                  <Badge className="px-4 py-2 text-sm">
                    ✨ 14 Day FREE Trial - No Credit Card Required
                  </Badge>
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    Complete Workshop Management
                    <span className="block text-primary mt-2">Made Simple</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-xl">
                    Everything you need to run your automotive workshop efficiently - from bookings to billing, all in one cloud-based platform.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="text-lg px-8 py-6 h-auto">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                      View All Features
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>No credit card needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden">
                  {/* Mock Dashboard Screenshot */}
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-white/80"></div>
                        <div className="h-3 w-3 rounded-full bg-white/60"></div>
                        <div className="h-3 w-3 rounded-full bg-white/40"></div>
                      </div>
                      <div className="text-sm font-medium">WorkshopPro Dashboard</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="text-sm opacity-80">Today's Jobs</div>
                        <div className="text-3xl font-bold mt-1">24</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                        <div className="text-sm opacity-80">Revenue</div>
                        <div className="text-3xl font-bold mt-1">$8.4K</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 bg-muted/30">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Service Booking - Toyota Camry</div>
                        <div className="text-xs text-muted-foreground">10:30 AM - Bay 2</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50">Confirmed</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <Wrench className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">WOF Inspection - Ford Ranger</div>
                        <div className="text-xs text-muted-foreground">2:00 PM - Bay 1</div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50">In Progress</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Invoice #2847</div>
                        <div className="text-xs text-muted-foreground">Brake Service - $450</div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Intuitive. Comprehensive. Simple.</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Manage every aspect of your workshop with ease
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {keyBenefits.map((benefit, idx) => (
                <Card key={idx} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Workshop Owners Choose WorkshopPro</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of workshops already streamlining their operations
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {whyChooseUs.map((reason, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{reason.title}</h3>
                  <ul className="space-y-3">
                    {reason.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for automotive workshops
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/features">
                <Button size="lg" variant="outline">
                  View All Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Suitable For */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect for Any Service Centre</h2>
              <p className="text-lg text-muted-foreground">
                Trusted by workshops of all types and sizes
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {suitableFor.map((type, idx) => (
                <Card key={idx} className="text-center hover:shadow-lg transition-all hover:border-primary/50">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <p className="font-medium text-sm">{type.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Workshop?
              </h2>
              <p className="text-xl opacity-90">
                Join hundreds of workshops already saving time and growing their business with WorkshopPro
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
                    Start Your 14-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-white text-white hover:bg-white/10">
                    Book a Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Full access to all features</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 bg-muted/30">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold">WorkshopPro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete workshop management for automotive professionals in NZ & Australia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                  <li><Link href="/addons" className="hover:text-foreground">Add-ons</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                  <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
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