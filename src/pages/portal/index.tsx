import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, FileText, DollarSign, Calendar, CheckCircle, XCircle, Clock, Home } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerPortalPage() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    // Mock data for demo
    setTimeout(() => {
      setVehicles([
        { id: "1", registration_number: "ABC123", make: "Toyota", model: "Corolla", year: 2020, wof_expiry: "2026-12-31" },
        { id: "2", registration_number: "XYZ789", make: "Honda", model: "Civic", year: 2019, rego_expiry: "2026-08-15" },
      ]);
      setJobs([
        { id: "1", order_number: "JOB-001", job_title: "Annual Service", status: "completed", vehicle_rego: "ABC123", created_at: "2026-04-01" },
      ]);
      setQuotes([
        { id: "1", quote_number: "QT-001", description: "Brake Replacement", status: "pending_approval", total: 450, vehicle_rego: "XYZ789", created_at: "2026-04-10" },
      ]);
      setInvoices([
        { id: "1", invoice_number: "INV-001", description: "Annual Service", status: "paid", total: 320, balance: 0, vehicle_rego: "ABC123", created_at: "2026-04-02" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8" />
              <div>
                <h1 className="font-heading text-2xl font-bold">AutoTech Workshop</h1>
                <p className="text-sm opacity-90">Customer Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">John Smith</span>
              <Button variant="secondary" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Welcome Card */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <h2 className="font-heading text-xl font-semibold mb-2">Welcome back, John!</h2>
            <p className="text-muted-foreground">
              View your vehicles, service history, and manage invoices from your dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                  <p className="text-xs text-muted-foreground">Vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{quotes.filter(q => q.status === "pending_approval").length}</p>
                  <p className="text-xs text-muted-foreground">Pending Quotes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$0.00</p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-muted-foreground">Due Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="jobs">Service History</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{vehicle.registration_number}</h3>
                      </div>
                      <p className="text-muted-foreground">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      {vehicle.wof_expiry && (
                        <div>
                          <p className="text-xs text-muted-foreground">WOF Expiry</p>
                          <p className="text-sm font-medium">{new Date(vehicle.wof_expiry).toLocaleDateString()}</p>
                        </div>
                      )}
                      {vehicle.rego_expiry && (
                        <div>
                          <p className="text-xs text-muted-foreground">Rego Expiry</p>
                          <p className="text-sm font-medium">{new Date(vehicle.rego_expiry).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
                <CardDescription>Your completed and active jobs</CardDescription>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No service history"
                    description="Your service records will appear here"
                  />
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{job.order_number}</p>
                              <StatusBadge type="job" status={job.status} />
                            </div>
                            <p className="text-sm">{job.job_title}</p>
                            <p className="text-sm text-muted-foreground">{job.vehicle_rego}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quotes</CardTitle>
                <CardDescription>Review and approve quotes</CardDescription>
              </CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No quotes"
                    description="Quotes will appear here for your approval"
                  />
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <Card key={quote.id} className="border-primary">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{quote.quote_number}</p>
                                <StatusBadge type="quote" status={quote.status} />
                              </div>
                              <p className="text-sm">{quote.description}</p>
                              <p className="text-sm text-muted-foreground">{quote.vehicle_rego}</p>
                            </div>
                            <div className="text-right space-y-2">
                              <p className="text-2xl font-bold">${quote.total.toFixed(2)}</p>
                              {quote.status === "pending_approval" && (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                  <Button size="sm">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>View and pay invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <EmptyState
                    icon={DollarSign}
                    title="No invoices"
                    description="Your invoices will appear here"
                  />
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{invoice.invoice_number}</p>
                              <StatusBadge type="invoice" status={invoice.status} />
                            </div>
                            <p className="text-sm">{invoice.description}</p>
                            <p className="text-sm text-muted-foreground">{invoice.vehicle_rego}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
                            {invoice.balance > 0 && (
                              <Button size="sm">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Pay ${invoice.balance.toFixed(2)}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Booking */}
        <Card className="border-accent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Need a service?</h3>
                <p className="text-sm text-muted-foreground">Request a booking online</p>
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Request Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}