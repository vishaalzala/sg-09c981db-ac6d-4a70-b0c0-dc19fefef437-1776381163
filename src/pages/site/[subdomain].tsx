import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { websiteService } from "@/services/websiteService";
import { bookingService } from "@/services/bookingService";
import { customerService } from "@/services/customerService";
import { vehicleService } from "@/services/vehicleService";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Calendar, Car, User } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function PublicWebsite() {
  const router = useRouter();
  const { subdomain } = router.query;
  const { toast } = useToast();

  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    name: "",
    mobile: "",
    email: "",
    rego: "",
    vin: "",
    make: "",
    model: "",
    service: "",
    preferred_date: "",
    preferred_time: "",
    issue: "",
    approval_limit: "",
    notes: ""
  });

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    name: "",
    mobile: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    if (subdomain) {
      loadWebsite();
    }
  }, [subdomain]);

  const loadWebsite = async () => {
    setLoading(true);
    try {
      // In production, this would query by subdomain
      // For now, we'll use a placeholder
      const data = await websiteService.getCompanyWebsite("placeholder-company-id");
      if (data && data.is_published) {
        setWebsite(data);
      }
    } catch (error) {
      console.error("Website load error:", error);
    }
    setLoading(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create or match customer
      const customerData = await customerService.createCustomer({
        company_id: website.company_id,
        name: bookingForm.name,
        mobile: bookingForm.mobile,
        email: bookingForm.email || null,
        source_of_business: "website",
        is_company: false,
        marketing_consent: true,
        phone: null,
        postal_address: null,
        postal_city: null,
        postal_postal_code: null,
        physical_address: null,
        physical_city: null,
        physical_postal_code: null,
        customer_number: null,
        fleet_billing_contact: null,
        is_fleet_account: false,
        notes: null,
        deleted_at: null,
        created_by: null,
      });

      // Create or match vehicle if rego provided
      let vehicleData = null;
      if (bookingForm.rego) {
        vehicleData = await vehicleService.createVehicle({
          company_id: website.company_id,
          customer_id: customerData.id,
          registration_number: bookingForm.rego,
          vin: bookingForm.vin || null,
          make: bookingForm.make || null,
          model: bookingForm.model || null,
          year: null,
          body_type: null,
          odometer: null,
          colour: null,
          engine_size: null,
          transmission: null,
          fuel_type: null,
          wof_expiry: null,
          rego_expiry: null,
          service_due_date: null,
          service_due_odometer: null,
          last_service_odometer: null,
          is_courtesy_vehicle: false,
          deleted_at: null,
          carjam_data: null,
          carjam_last_fetched: null,
          notes: null,
          created_by: null,
          last_service_date: null,
          odometer_unit: "km",
        });
      }

      // Create booking
      await bookingService.createBooking({
        company_id: website.company_id,
        customer_id: customerData.id,
        vehicle_id: vehicleData?.id || null,
        booking_date: bookingForm.preferred_date,
        start_time: bookingForm.preferred_time || null,
        estimated_finish_time: null,
        service_type: bookingForm.service,
        description: bookingForm.issue,
        notes: bookingForm.notes ? `Source: Website\n\n${bookingForm.notes}` : "Source: Website",
        status: "pending",
        approval_limit: bookingForm.approval_limit ? parseFloat(bookingForm.approval_limit) : null,
        branch_id: null,
        assigned_technician_id: null,
        courtesy_vehicle_required: false,
        pickup_time: null,
        created_by: null,
        cancelled_at: null,
        cancelled_by: null,
        cancellation_reason: null,
      });

      // Track analytics
      await websiteService.trackAnalytics(website.id, website.company_id, "booking");

      toast({ title: "Booking Submitted", description: "We'll contact you shortly to confirm." });
      setBookingOpen(false);
      setBookingForm({
        name: "",
        mobile: "",
        email: "",
        rego: "",
        vin: "",
        make: "",
        model: "",
        service: "",
        preferred_date: "",
        preferred_time: "",
        issue: "",
        approval_limit: "",
        notes: ""
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Store lead
      await websiteService.trackAnalytics(website.id, website.company_id, "lead");

      toast({ title: "Message Sent", description: "Thank you for your inquiry. We'll be in touch soon." });
      setLeadOpen(false);
      setLeadForm({ name: "", mobile: "", email: "", message: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Website not found or unpublished.</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={website.seo_title || `${website.business_name} - Automotive Workshop`}
        description={website.seo_description || website.about_text}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold">{website.business_name}</h1>
            <nav className="flex gap-4">
              <a href="#services" className="hover:text-primary">Services</a>
              <a href="#about" className="hover:text-primary">About</a>
              <a href="#contact" className="hover:text-primary">Contact</a>
              {website.show_portal_link && (
                <Button variant="outline" size="sm" onClick={() => router.push("/portal")}>
                  Customer Login
                </Button>
              )}
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-heading font-bold mb-4">{website.business_name}</h2>
            {website.tagline && (
              <p className="text-xl text-muted-foreground mb-8">{website.tagline}</p>
            )}
            {website.show_booking_form && (
              <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="mr-4">
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Book a Service</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input required value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile *</Label>
                        <Input required type="tel" value={bookingForm.mobile} onChange={e => setBookingForm({...bookingForm, mobile: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Registration</Label>
                        <Input value={bookingForm.rego} onChange={e => setBookingForm({...bookingForm, rego: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Make</Label>
                        <Input value={bookingForm.make} onChange={e => setBookingForm({...bookingForm, make: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Model</Label>
                        <Input value={bookingForm.model} onChange={e => setBookingForm({...bookingForm, model: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Service Required *</Label>
                        <Input required value={bookingForm.service} onChange={e => setBookingForm({...bookingForm, service: e.target.value})} placeholder="e.g., WOF, Service, Repairs" />
                      </div>
                      <div className="space-y-2">
                        <Label>Preferred Date *</Label>
                        <Input required type="date" value={bookingForm.preferred_date} onChange={e => setBookingForm({...bookingForm, preferred_date: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Preferred Time</Label>
                        <Input type="time" value={bookingForm.preferred_time} onChange={e => setBookingForm({...bookingForm, preferred_time: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Approval Limit</Label>
                        <Input type="number" value={bookingForm.approval_limit} onChange={e => setBookingForm({...bookingForm, approval_limit: e.target.value})} placeholder="Maximum spend" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Description</Label>
                      <Textarea rows={3} value={bookingForm.issue} onChange={e => setBookingForm({...bookingForm, issue: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea rows={2} value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full">Submit Booking Request</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            {website.show_lead_form && (
              <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline">Contact Us</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Get in Touch</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input required value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile *</Label>
                      <Input required type="tel" value={leadForm.mobile} onChange={e => setLeadForm({...leadForm, mobile: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Textarea required rows={4} value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>WOF Inspections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Certified WOF inspections to keep you road-legal.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Servicing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Full vehicle servicing and maintenance.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Repairs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Expert diagnostics and repairs for all makes.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About */}
        {website.about_text && (
          <section id="about" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl text-center">
              <h2 className="text-3xl font-heading font-bold mb-6">About Us</h2>
              <p className="text-lg text-muted-foreground whitespace-pre-wrap">{website.about_text}</p>
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center mb-12">Contact Us</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {website.phone && (
                <div className="flex flex-col items-center text-center">
                  <Phone className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <a href={`tel:${website.phone}`} className="text-muted-foreground hover:text-primary">{website.phone}</a>
                </div>
              )}
              {website.email && (
                <div className="flex flex-col items-center text-center">
                  <Mail className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a href={`mailto:${website.email}`} className="text-muted-foreground hover:text-primary">{website.email}</a>
                </div>
              )}
              {website.address && (
                <div className="flex flex-col items-center text-center">
                  <MapPin className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-muted-foreground">{website.address}</p>
                </div>
              )}
            </div>
            {website.hours && (
              <div className="flex flex-col items-center text-center mt-8">
                <Clock className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Opening Hours</h3>
                <p className="text-muted-foreground">{website.hours}</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 bg-muted/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {website.business_name}. All rights reserved.</p>
            <p className="mt-2">Powered by Softgen Workshop Management</p>
          </div>
        </footer>
      </div>
    </>
  );
}