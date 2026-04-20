import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ReminderStatus = "pending" | "sent" | "completed" | "cancelled" | string;

interface ReminderRow {
  id: string;
  company_id: string;
  customer_id: string | null;
  vehicle_id: string | null;
  reminder_type: string;
  due_date: string;
  reminder_note: string | null;
  status: ReminderStatus | null;
  created_at: string;
  customers?: { id: string; name: string | null } | null;
  vehicles?: { id: string; registration_number: string | null; make: string | null; model: string | null; year: number | null } | null;
}

function statusBadgeVariant(status: ReminderStatus | null): "default" | "secondary" | "outline" | "destructive" {
  const s = (status || "pending").toLowerCase();
  if (s === "completed") return "default";
  if (s === "sent") return "secondary";
  if (s === "cancelled") return "outline";
  if (s === "overdue") return "destructive";
  return "outline";
}

export default function DashboardRemindersPage() {
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ReminderRow[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return;

        const { data: userData, error: userError } = await supabase.from("users").select("company_id").eq("id", user.id).single();
        if (userError) throw userError;

        const cid = userData?.company_id ?? "";
        setCompanyId(cid);

        if (!cid) {
          toast({ title: "No company", description: "No company context found for your user.", variant: "destructive" });
          return;
        }

        const { data, error } = await supabase
          .from("reminders")
          .select(
            `
            id,
            company_id,
            customer_id,
            vehicle_id,
            reminder_type,
            due_date,
            reminder_note,
            status,
            created_at,
            customers:customers(id,name),
            vehicles:vehicles(id,registration_number,make,model,year)
          `
          )
          .eq("company_id", cid)
          .order("due_date", { ascending: true });

        if (error) throw error;

        setRows((data || []) as unknown as ReminderRow[]);
      } catch (e: any) {
        console.error("Load reminders error:", e);
        toast({ title: "Error", description: e?.message || "Failed to load reminders", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const customerName = r.customers?.name || "";
      const rego = r.vehicles?.registration_number || "";
      const vehicleText = [r.vehicles?.make, r.vehicles?.model, r.vehicles?.year].filter(Boolean).join(" ");
      const type = r.reminder_type || "";
      const note = r.reminder_note || "";
      return [customerName, rego, vehicleText, type, note].some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search]);

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Reminders</h1>
            <p className="text-sm text-muted-foreground">Synced with Quote/Invoice creation panels.</p>
          </div>
          <div className="flex gap-2 items-center">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer / rego / type..." className="md:w-[320px]" />
            <Link href="/dashboard/settings/reminders">
              <Button variant="outline">Reminder Types</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reminders found.</div>
            ) : (
              <div className="overflow-auto border rounded-lg">
                <table className="w-full text-sm min-w-[860px]">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-3 text-xs font-bold uppercase text-muted-foreground">Due</th>
                      <th className="text-left p-3 text-xs font-bold uppercase text-muted-foreground">Type</th>
                      <th className="text-left p-3 text-xs font-bold uppercase text-muted-foreground">Customer</th>
                      <th className="text-left p-3 text-xs font-bold uppercase text-muted-foreground">Vehicle</th>
                      <th className="text-left p-3 text-xs font-bold uppercase text-muted-foreground">Note</th>
                      <th className="text-left p-3 text-xs font-bold uppercase text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="p-3 whitespace-nowrap">{r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}</td>
                        <td className="p-3 whitespace-nowrap">{r.reminder_type || "—"}</td>
                        <td className="p-3 whitespace-nowrap">{r.customers?.name || "—"}</td>
                        <td className="p-3 whitespace-nowrap">
                          {r.vehicles?.registration_number ? (
                            <span>
                              {r.vehicles.registration_number} · {[r.vehicles.make, r.vehicles.model, r.vehicles.year].filter(Boolean).join(" ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">{r.reminder_note || "—"}</td>
                        <td className="p-3 whitespace-nowrap">
                          <Badge variant={statusBadgeVariant(r.status)}>{(r.status || "pending").toString()}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && companyId ? (
              <div className="mt-3 text-xs text-muted-foreground">
                Company: <span className="font-medium text-foreground">{companyId}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}