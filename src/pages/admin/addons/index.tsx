import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { createAddon, getAllAddons, updateAddon } from "@/services/adminService";
import { Edit, Plus, Save, XCircle } from "lucide-react";

type AddonForm = {
    id?: string;
    name: string;
    display_name: string;
    description: string;
    addon_type: string;
    price_monthly: string;
    price_annual: string;
    is_active: boolean;
    is_public: boolean;
    is_available_for_signup: boolean;
    internal_only: boolean;
    sort_order: string;
};

const emptyAddon: AddonForm = {
    name: "",
    display_name: "",
    description: "",
    addon_type: "fixed",
    price_monthly: "0",
    price_annual: "0",
    is_active: true,
    is_public: false,
    is_available_for_signup: false,
    internal_only: false,
    sort_order: "100",
};

const slug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export default function AdminAddonsRoute() {
    const [addons, setAddons] = useState < any[] > ([]);
    const [form, setForm] = useState < AddonForm > (emptyAddon);
    const [editingId, setEditingId] = useState < string | null > (null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadAddons = async () => {
        try { setAddons(await getAllAddons()); } catch (err: any) { setError(err.message || "Failed to load add-ons"); }
    };
    useEffect(() => { void loadAddons(); }, []);

    const setField = (key: keyof AddonForm, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
    const cancel = () => { setEditingId(null); setForm(emptyAddon); setError(""); };
    const edit = (addon: any) => {
        setEditingId(addon.id);
        setForm({
            id: addon.id,
            name: addon.name || "",
            display_name: addon.display_name || addon.name || "",
            description: addon.description || "",
            addon_type: addon.addon_type || "fixed",
            price_monthly: String(addon.price_monthly ?? 0),
            price_annual: String(addon.price_annual ?? 0),
            is_active: addon.is_active !== false,
            is_public: addon.is_public === true,
            is_available_for_signup: addon.is_available_for_signup === true,
            internal_only: addon.internal_only === true,
            sort_order: String(addon.sort_order ?? 100),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const save = async () => {
        setSaving(true); setError(""); setSuccess("");
        try {
            const displayName = form.display_name.trim();
            const name = slug(form.name || displayName);
            if (!name || !displayName) throw new Error("Add-on name and display name are required");
            const payload: any = {
                name,
                display_name: displayName,
                description: form.description.trim() || null,
                addon_type: form.addon_type || "fixed",
                price_monthly: Number(form.price_monthly || 0),
                price_annual: Number(form.price_annual || 0),
                is_active: form.is_active,
                is_public: form.is_public,
                is_available_for_signup: form.is_available_for_signup,
                internal_only: form.internal_only,
                sort_order: Number(form.sort_order || 100),
            };
            if (editingId) await updateAddon(editingId, payload); else await createAddon(payload);
            setSuccess(editingId ? "Add-on updated" : "Add-on created");
            cancel(); await loadAddons();
        } catch (err: any) { setError(err.message || "Failed to save add-on"); }
        finally { setSaving(false); }
    };

    return <AdminPageShell title="Add-ons" description="Create and control WOF and future paid modules. Public/signup visibility is now admin-controlled.">
        <div className="space-y-6">
            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            {success ? <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div> : null}
            <Card><CardHeader><CardTitle>{editingId ? "Edit add-on" : "Create add-on"}</CardTitle><CardDescription>Use this catalog for WOF, Smart Sales Lead, marketing, website builder and future modules.</CardDescription></CardHeader><CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Add-on slug</Label><Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="wof_inspections" /></div>
                    <div className="space-y-2"><Label>Display name</Label><Input value={form.display_name} onChange={(e) => setField("display_name", e.target.value)} placeholder="WOF Inspections" /></div>
                    <div className="space-y-2"><Label>Type</Label><Input value={form.addon_type} onChange={(e) => setField("addon_type", e.target.value)} placeholder="fixed / usage / metered" /></div>
                    <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setField("sort_order", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Monthly price</Label><Input type="number" value={form.price_monthly} onChange={(e) => setField("price_monthly", e.target.value)} /></div>
                    <div className="space-y-2"><Label>Annual price</Label><Input type="number" value={form.price_annual} onChange={(e) => setField("price_annual", e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} /></div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[["is_active", "Active"], ["is_public", "Public"], ["is_available_for_signup", "Signup visible"], ["internal_only", "Internal only"]].map(([key, label]) => <label key={key} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{label}</span><Switch checked={(form as any)[key]} onCheckedChange={(v) => setField(key as keyof AddonForm, v)} /></label>)}
                </div>
                <div className="flex gap-2"><Button onClick={save} disabled={saving}>{editingId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{saving ? "Saving..." : editingId ? "Save add-on" : "Create add-on"}</Button>{editingId ? <Button variant="outline" onClick={cancel}><XCircle className="mr-2 h-4 w-4" />Cancel</Button> : null}</div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Add-on catalog</CardTitle><CardDescription>DB-backed add-ons with visibility controls.</CardDescription></CardHeader><CardContent className="space-y-3">
                {addons.map((addon) => <div key={addon.id} className="rounded-lg border p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><div className="font-semibold">{addon.display_name || addon.name}</div>{addon.is_active !== false ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}{addon.is_public ? <Badge variant="outline">Public</Badge> : <Badge variant="secondary">Hidden</Badge>}{addon.is_available_for_signup ? <Badge variant="outline">Signup</Badge> : null}{addon.internal_only ? <Badge variant="secondary">Internal</Badge> : null}</div><div className="mt-1 text-sm text-muted-foreground">{addon.addon_type || "fixed"} · Monthly: ${Number(addon.price_monthly || 0).toFixed(2)} · Annual: ${Number(addon.price_annual || 0).toFixed(2)}</div></div><Button variant="outline" size="sm" onClick={() => edit(addon)}><Edit className="mr-2 h-4 w-4" />Edit</Button></div></div>)}
                {!addons.length ? <div className="text-sm text-muted-foreground">No add-ons yet. Create your first add-on above.</div> : null}
            </CardContent></Card>
        </div>
    </AdminPageShell>;
}
