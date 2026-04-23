import { useEffect, useState } from "react";
import { WofPortalLayout } from "@/components/wof/WofPortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function WofProfilePage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", inspector_number: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: profile }, { data: cert }] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
        supabase.from("inspector_certifications").select("certification_number, phone").eq("inspector_id", user.id).maybeSingle(),
      ]);
      setForm({
        full_name: (profile as any)?.full_name || "",
        email: (profile as any)?.email || user.email || "",
        phone: (cert as any)?.phone || "",
        inspector_number: (cert as any)?.certification_number || "",
      });
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("profiles").update({ full_name: form.full_name, email: form.email } as any).eq("id", user.id);
      const existing = await supabase.from("inspector_certifications").select("id").eq("inspector_id", user.id).maybeSingle();
      if ((existing as any).data?.id) {
        await supabase.from("inspector_certifications").update({ certification_number: form.inspector_number, phone: form.phone } as any).eq("id", (existing as any).data.id);
      } else {
        const company = await (await import("@/services/companyService")).companyService.getCurrentCompany();
        await supabase.from("inspector_certifications").insert({ company_id: company?.id, inspector_id: user.id, certification_number: form.inspector_number, phone: form.phone, status: "active" } as any);
      }
      alert("Profile updated successfully.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <WofPortalLayout title="Profile" subtitle="Update your WOF inspector details.">
      <section className="max-w-3xl rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div><label className="mb-2 block text-sm font-semibold">Name</label><input className="h-[46px] w-full rounded-[14px] border border-slate-300 px-4" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><label className="mb-2 block text-sm font-semibold">Phone</label><input className="h-[46px] w-full rounded-[14px] border border-slate-300 px-4" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="mb-2 block text-sm font-semibold">Email</label><input className="h-[46px] w-full rounded-[14px] border border-slate-300 px-4" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="mb-2 block text-sm font-semibold">WOF Inspector No.</label><input className="h-[46px] w-full rounded-[14px] border border-slate-300 px-4" value={form.inspector_number} onChange={(e) => setForm({ ...form, inspector_number: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex justify-end"><Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button></div>
      </section>
    </WofPortalLayout>
  );
}
