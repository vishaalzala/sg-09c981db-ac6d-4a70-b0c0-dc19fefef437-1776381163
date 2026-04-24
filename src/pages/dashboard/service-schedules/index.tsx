import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

export default function DashboardServiceSchedulesPage() {
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [reminders, setReminders] = useState < any[] > ([]);
    const [selected, setSelected] = useState < string[] > ([]);
    const [sending, setSending] = useState(false);
    useEffect(() => { void load(); }, []);
    const load = async () => {
        const company = await companyService.getCurrentCompany();
        if (!company?.id) return;
        setCompanyId(company.id); setCompanyName(company.name || "");
        const { data } = await (supabase as any).from("reminders").select("*").eq("company_id", company.id).limit(100);
        setReminders(data || []);
    };
    const queueReminders = async () => {
        setSending(true);
        try {
            const rows = selected.map((reminderId) => ({ company_id: companyId, reminder_id: reminderId, method: "email", status: "queued", created_at: new Date().toISOString(), metadata: {} }));
            if (rows.length) {
                const { error } = await (supabase as any).from("reminder_logs").insert(rows);
                if (error) throw error;
            }
            toast({ title: "Reminders queued", description: `${rows.length} reminder(s) queued.` });
            setSelected([]);
        } catch (error: any) { toast({ title: "Queue failed", description: error.message, variant: "destructive" }); }
        finally { setSending(false); }
    };
    return <AppLayout companyId={companyId} companyName={companyName}><div className="p-6 space-y-6"><div className="flex justify-between"><h1 className="text-3xl font-bold">Service Reminders</h1><Button onClick={queueReminders} disabled={sending || selected.length === 0}>{sending ? "Queuing..." : "Queue Selected"}</Button></div><Card><CardHeader><CardTitle>Reminder queue</CardTitle></CardHeader><CardContent className="space-y-3">{reminders.length === 0 ? <p className="text-muted-foreground">No reminders found.</p> : reminders.map((r) => <label key={r.id} className="flex items-center gap-3 rounded border p-3"><Checkbox checked={selected.includes(r.id)} onCheckedChange={(v) => setSelected((cur) => v ? [...cur, r.id] : cur.filter((id) => id !== r.id))} /><span>{r.title || r.name || r.reminder_type || r.id}</span></label>)}</CardContent></Card></div></AppLayout>;
}
