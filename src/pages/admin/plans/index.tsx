import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { createPlan, getAllPlans, updatePlan } from "@/services/adminService";
import { CheckCircle2, Edit, Plus, Save, XCircle } from "lucide-react";

type PlanForm = {
    id?: string;
    name: string;
    display_name: string;
    description: string;
    price_monthly: string;
    price_annual: string;
    trial_days: string;
    max_users: string;
    max_branches: string;
    features_text: string;
    is_active: boolean;
    is_public: boolean;
    show_on_homepage: boolean;
    show_on_pricing: boolean;
    sort_order: string;
};

const emptyPlan: PlanForm = {
    name: "",
    display_name: "",
    description: "",
    price_monthly: "0",
    price_annual: "0",
    trial_days: "14",
    max_users: "",
    max_branches: "",
    features_text: "",
    is_active: true,
    is_public: true,
    show_on_homepage: true,
    show_on_pricing: true,
    sort_order: "100",
};

function featuresToText(features: any) {
    if (Array.isArray(features)) return features.join("\n");
    if (features && typeof features === "object") {
        return Object.entries(features)
            .map(([key, value]) => (Array.isArray(value) ? `${key}: ${value.join(", ")}` : `${key}: ${String(value)}`))
            .join("\n");
    }
    return "";
}

function normaliseSlug(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export default function AdminPlansRoute() {
    const [plans, setPlans] = useState < any[] > ([]);
    const [form, setForm] = useState < PlanForm > (emptyPlan);
    const [editingId, setEditingId] = useState < string | null > (null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    const loadPlans = async () => {
        setError("");
        try {
            setPlans(await getAllPlans());
        } catch (err: any) {
            setError(err.message || "Failed to load plans");
        }
    };

    useEffect(() => { void loadPlans(); }, []);

    const visibleCounts = useMemo(() => ({
        active: plans.filter((p) => p.is_active !== false).length,
        homepage: plans.filter((p) => p.show_on_homepage !== false && p.is_public !== false && p.is_active !== false).length,
        pricing: plans.filter((p) => p.show_on_pricing !== false && p.is_public !== false && p.is_active !== false).length,
    }), [plans]);

    const startEdit = (plan: any) => {
        setEditingId(plan.id);
        setForm({
            id: plan.id,
            name: plan.name || "",
            display_name: plan.display_name || plan.name || "",
            description: plan.description || "",
            price_monthly: String(plan.price_monthly ?? 0),
            price_annual: String(plan.price_annual ?? 0),
            trial_days: String(plan.trial_days ?? 14),
            max_users: plan.max_users == null ? "" : String(plan.max_users),
            max_branches: plan.max_branches == null ? "" : String(plan.max_branches),
            features_text: featuresToText(plan.features),
            is_active: plan.is_active !== false,
            is_public: plan.is_public !== false,
            show_on_homepage: plan.show_on_homepage !== false,
            show_on_pricing: plan.show_on_pricing !== false,
            sort_order: String(plan.sort_order ?? 100),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyPlan);
        setError("");
    };

    const savePlan = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const displayName = form.display_name.trim();
            const name = normaliseSlug(form.name || displayName);
            if (!name || !displayName) throw new Error("Plan name and display name are required");

            const payload: any = {
                name,
                display_name: displayName,
                description: form.description.trim() || null,
                price_monthly: Number(form.price_monthly || 0),
                price_annual: Number(form.price_annual || 0),
                trial_days: Number(form.trial_days || 0),
                max_users: form.max_users === "" ? null : Number(form.max_users),
                max_branches: form.max_branches === "" ? null : Number(form.max_branches),
                features: form.features_text.split("\n").map((v) => v.trim()).filter(Boolean),
                is_active: form.is_active,
                is_public: form.is_public,
                show_on_homepage: form.show_on_homepage,
                show_on_pricing: form.show_on_pricing,
                sort_order: Number(form.sort_order || 100),
            };

            if (editingId) await updatePlan(editingId, payload);
            else await createPlan(payload);

            setSuccess(editingId ? "Plan updated" : "Plan created");
            cancelEdit();
            await loadPlans();
        } catch (err: any) {
            setError(err.message || "Failed to save plan");
        } finally {
            setSaving(false);
        }
    };

    const setField = (key: keyof PlanForm, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

    return (
        <AdminPageShell title="Plans" description="Create and control the plan catalog used by website pricing, signup, trial onboarding, and company subscriptions.">
            <div className="space-y-6">
                {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
                {success ? <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div> : null}

                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? "Edit plan" : "Create plan"}</CardTitle>
                        <CardDescription>No more hardcoded plans. This form controls what appears in admin, pricing, homepage, and signup.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label>Plan slug</Label><Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="starter" /></div>
                            <div className="space-y-2"><Label>Display name</Label><Input value={form.display_name} onChange={(e) => setField("display_name", e.target.value)} placeholder="Starter" /></div>
                            <div className="space-y-2"><Label>Monthly price</Label><Input type="number" value={form.price_monthly} onChange={(e) => setField("price_monthly", e.target.value)} /></div>
                            <div className="space-y-2"><Label>Annual price</Label><Input type="number" value={form.price_annual} onChange={(e) => setField("price_annual", e.target.value)} /></div>
                            <div className="space-y-2"><Label>Trial days</Label><Input type="number" value={form.trial_days} onChange={(e) => setField("trial_days", e.target.value)} /></div>
                            <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setField("sort_order", e.target.value)} /></div>
                            <div className="space-y-2"><Label>Max users</Label><Input type="number" value={form.max_users} onChange={(e) => setField("max_users", e.target.value)} placeholder="blank = unlimited" /></div>
                            <div className="space-y-2"><Label>Max branches</Label><Input type="number" value={form.max_branches} onChange={(e) => setField("max_branches", e.target.value)} placeholder="blank = unlimited" /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={2} /></div>
                        <div className="space-y-2"><Label>Features shown to customers, one per line</Label><Textarea value={form.features_text} onChange={(e) => setField("features_text", e.target.value)} rows={5} placeholder="Jobs, quotes and invoices\nCustomer and vehicle CRM" /></div>
                        <div className="grid gap-4 md:grid-cols-4">
                            {[
                                ["is_active", "Active"],
                                ["is_public", "Public"],
                                ["show_on_homepage", "Show on homepage"],
                                ["show_on_pricing", "Show on pricing"]
                            ].map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{label}</span><Switch checked={(form as any)[key]} onCheckedChange={(v) => setField(key as keyof PlanForm, v)} /></label>)}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={savePlan} disabled={saving}>{editingId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{saving ? "Saving..." : editingId ? "Save plan" : "Create plan"}</Button>
                            {editingId ? <Button variant="outline" onClick={cancelEdit}><XCircle className="mr-2 h-4 w-4" />Cancel</Button> : null}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Plan catalog</CardTitle>
                        <CardDescription>{visibleCounts.active} active · {visibleCounts.homepage} homepage · {visibleCounts.pricing} pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {plans.map((plan) => <div key={plan.id} className="rounded-lg border p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2"><div className="font-semibold">{plan.display_name || plan.name}</div>{plan.is_active !== false ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}{plan.is_public !== false ? <Badge variant="outline">Public</Badge> : <Badge variant="secondary">Hidden</Badge>}{plan.show_on_homepage !== false ? <Badge variant="outline">Homepage</Badge> : null}{plan.show_on_pricing !== false ? <Badge variant="outline">Pricing</Badge> : null}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">Monthly: ${Number(plan.price_monthly || 0).toFixed(2)} · Annual: ${Number(plan.price_annual || 0).toFixed(2)} · Trial: {plan.trial_days ?? 14} days</div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => startEdit(plan)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                            </div>
                        </div>)}
                        {!plans.length ? <div className="text-sm text-muted-foreground">No plans yet. Create your first plan above.</div> : null}
                    </CardContent>
                </Card>
            </div>
        </AdminPageShell>
    );
}
