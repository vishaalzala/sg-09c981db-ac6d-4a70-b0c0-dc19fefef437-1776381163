import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CalendarPlus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";

export default function NewBookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerId: "", vehicleId: "", date: "", time: "08:00", duration: "60", jobType: "Service", notes: "" });

  useEffect(() => { void load(); }, []);

  const load = async () => {
    const company = await companyService.getCurrentCompany();
    if (!company?.id) return;
    setCompanyId(company.id);
    const [{ data: customerRows }, { data: vehicleRows }] = await Promise.all([
      (supabase as any).from("customers").select("id, name").eq("company_id", company.id).is("deleted_at", null).order("name"),
      (supabase as any).from("vehicles").select("id, customer_id, registration_number, make, model").eq("company_id", company.id).is("deleted_at", null).order("registration_number"),
    ]);
    setCustomers(customerRows || []);
    setVehicles(vehicleRows || []);
  };

  const handleSave = async () => {
    if (!companyId || !form.customerId || !form.date) {
      toast({ title: "Missing details", description: "Customer and date are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await (supabase as any).from("bookings").insert({
        company_id: companyId,
        customer_id: form.customerId,
        vehicle_id: form.vehicleId || null,
        booking_date: form.date,
        booking_time: form.time || null,
        duration_minutes: Number(form.duration || 60),
        job_type: form.jobType,
        notes: form.notes || null,
        status: "scheduled",
        created_by: userData.user?.id || null,
      });
      if (error) throw error;
      toast({ title: "Booking created", description: "The booking has been saved." });
      router.push("/dashboard/bookings");
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message || "Could not create booking.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const filteredVehicles = vehicles.filter((v) => !form.customerId || v.customer_id === form.customerId);

  return (
    <AppLayout companyId={companyId}>
      <div className="p-6 space-y-6">
        <div><h1 className="text-3xl font-bold flex items-center gap-2"><CalendarPlus className="h-7 w-7" /> New Booking</h1><p className="text-muted-foreground">Create a real booking record.</p></div>
        <Card><CardHeader><CardTitle>Booking Details</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label>Customer *</Label><Select value={form.customerId} onValueChange={(v) => setForm((p) => ({ ...p, customerId: v, vehicleId: "" }))}><SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger><SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Vehicle</Label><Select value={form.vehicleId} onValueChange={(v) => setForm((p) => ({ ...p, vehicleId: v }))}><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger><SelectContent>{filteredVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registration_number} {v.make} {v.model}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Duration minutes</Label><Input type="number" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} /></div>
          <div className="space-y-2"><Label>Job type</Label><Input value={form.jobType} onChange={(e) => setForm((p) => ({ ...p, jobType: e.target.value }))} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea rows={4} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
          <div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={() => router.push("/dashboard/bookings")}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Booking"}</Button></div>
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
