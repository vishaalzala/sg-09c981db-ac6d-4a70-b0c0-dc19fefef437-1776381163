import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";

export default function DashboardCustomerDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [customer, setCustomer] = useState < any > (null);
    const [loading, setLoading] = useState(true);
    const [showStatement, setShowStatement] = useState(false);
    const [showMerge, setShowMerge] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [statementMessage, setStatementMessage] = useState("");
    const [targetCustomerId, setTargetCustomerId] = useState("");
    const [saving, setSaving] = useState(false);

    const customerId = typeof id === "string" ? id : "";

    useEffect(() => {
        if (router.isReady && customerId) void loadCustomer();
    }, [router.isReady, customerId]);

    const loadCustomer = async () => {
        setLoading(true);
        try {
            const company = await companyService.getCurrentCompany();
            if (!company?.id) throw new Error("No company found");
            setCompanyId(company.id);
            setCompanyName(company.name || "");
            const { data, error } = await (supabase as any)
                .from("customers")
                .select("*")
                .eq("id", customerId)
                .eq("company_id", company.id)
                .maybeSingle();
            if (error) throw error;
            setCustomer(data);
            setRecipientEmail(data?.email || "");
            setStatementMessage(`Hi ${data?.name || "there"},\n\nYour customer statement is attached/queued.\n\nThank you.`);
        } catch (error: any) {
            toast({ title: "Could not load customer", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const sendStatement = async () => {
        setSaving(true);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error("You must be logged in");
            const response = await fetch("/api/customers/send-statement", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ customerId, recipientEmail, message: statementMessage }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || "Could not queue statement");
            toast({ title: "Statement queued", description: `Statement queued for ${recipientEmail}` });
            setShowStatement(false);
        } catch (error: any) {
            toast({ title: "Statement failed", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const mergeCustomer = async () => {
        if (!targetCustomerId.trim()) {
            toast({ title: "Target customer required", description: "Enter the customer ID to merge into.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) throw new Error("You must be logged in");
            const response = await fetch("/api/customers/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sourceCustomerId: customerId, targetCustomerId: targetCustomerId.trim() }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || "Could not merge customers");
            toast({ title: "Customer merged", description: "Records moved to the target customer." });
            router.replace(`/dashboard/customers/${targetCustomerId.trim()}`);
        } catch (error: any) {
            toast({ title: "Merge failed", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout companyId={companyId} companyName={companyName}>
            <div className="p-6 space-y-6">
                <Button variant="outline" onClick={() => router.push("/dashboard/customers")}>Back to Customers</Button>
                <Card>
                    <CardHeader><CardTitle>{loading ? "Loading..." : customer?.name || "Customer"}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {!loading && !customer ? <p>Customer not found.</p> : null}
                        {customer && (
                            <>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div><Label>Email</Label><p>{customer.email || "-"}</p></div>
                                    <div><Label>Phone</Label><p>{customer.mobile || customer.phone || "-"}</p></div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => setShowStatement(true)}>Send Statement</Button>
                                    <Button variant="outline" onClick={() => setShowMerge(true)}>Merge Customer</Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showStatement} onOpenChange={setShowStatement}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Send Customer Statement</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div><Label>Recipient email</Label><Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
                        <div><Label>Message</Label><Textarea rows={5} value={statementMessage} onChange={(e) => setStatementMessage(e.target.value)} /></div>
                        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowStatement(false)}>Cancel</Button><Button onClick={sendStatement} disabled={saving}>{saving ? "Queuing..." : "Queue Statement"}</Button></div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showMerge} onOpenChange={setShowMerge}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Merge Customer</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Enter the customer ID to keep. All vehicles/jobs/invoices/quotes/payments will move to that customer. This customer will be soft-deleted.</p>
                        <div><Label>Target customer ID</Label><Input value={targetCustomerId} onChange={(e) => setTargetCustomerId(e.target.value)} /></div>
                        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowMerge(false)}>Cancel</Button><Button onClick={mergeCustomer} disabled={saving}>{saving ? "Merging..." : "Merge"}</Button></div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
