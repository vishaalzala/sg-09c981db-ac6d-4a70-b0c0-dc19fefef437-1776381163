import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Clock, User, Car, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { bookingService } from "@/services/bookingService";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { demoBookings } from "@/lib/demoData";

export default function BookingsPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // DEMO MODE: Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    
    // DEMO MODE: Use mock data
    if (isDemoMode) {
      console.log("🎭 DEMO MODE - Using mock booking data");
      setBookings(demoBookings);
      setCompanyId("demo-company-id");
      setLoading(false);
      return;
    }

    // PRODUCTION MODE: Load real data
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const data = await bookingService.getBookings(company.id, undefined, selectedDate);
      setBookings(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Service Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground mt-1">
              Manage workshop appointments and schedule
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>

        {/* Date Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Viewing bookings for {selectedDate}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() - 1);
                    setSelectedDate(date.toISOString().split("T")[0]);
                  }}
                >
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const date = new Date(selectedDate);
                    date.setDate(date.getDate() + 1);
                    setSelectedDate(date.toISOString().split("T")[0]);
                  }}
                >
                  Next Day
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No bookings"
                description="No bookings scheduled for this date"
                action={{
                  label: "Create Booking",
                  onClick: () => {},
                }}
              />
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer;
                  const vehicle = Array.isArray(booking.vehicle) ? booking.vehicle[0] : booking.vehicle;
                  const mechanic = Array.isArray(booking.assigned_mechanic) ? booking.assigned_mechanic[0] : booking.assigned_mechanic;

                  return (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{new Date(booking.start_time).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}</span>
                            {booking.end_time && (
                              <span className="text-sm text-muted-foreground">
                                - {new Date(booking.end_time).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            <StatusBadge status={booking.status} type="booking" />
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.customer_name || customer?.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {booking.vehicle_rego} {vehicle && `- ${vehicle.make} ${vehicle.model}`}
                            </span>
                          </div>

                          {booking.service_type && (
                            <div className="text-sm">
                              <span className="font-medium">Service:</span> {booking.service_type}
                            </div>
                          )}

                          {booking.notes && (
                            <p className="text-sm text-muted-foreground">
                              {booking.notes}
                            </p>
                          )}
                        </div>

                        <div className="text-right space-y-2">
                          {mechanic && (
                            <div className="flex items-center gap-2 text-sm">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              <span>{mechanic.full_name}</span>
                            </div>
                          )}

                          {booking.courtesy_vehicle_required && (
                            <Badge variant="outline" className="text-xs">
                              Courtesy Vehicle
                            </Badge>
                          )}

                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}