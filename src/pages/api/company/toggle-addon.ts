import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const admin = getSupabaseAdmin();
    const token = String(req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const { data: auth } = await admin.auth.getUser(token);
    if (!auth.user) return res.status(401).json({ error: "Invalid session" });

    const { addonId, enabled } = req.body || {};
    if (!addonId || typeof enabled !== "boolean") return res.status(400).json({ error: "addonId and enabled are required" });

    const { data: userRow } = await admin.from("users").select("company_id").eq("id", auth.user.id).single();
    if (!userRow?.company_id) return res.status(403).json({ error: "No company found" });

    const now = new Date().toISOString();
    const { data: existing } = await admin
      .from("company_addons")
      .select("id")
      .eq("company_id", userRow.company_id)
      .eq("addon_id", addonId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await admin.from("company_addons").update({
        is_enabled: enabled,
        enabled_at: enabled ? now : null,
        disabled_at: enabled ? null : now,
        updated_at: now,
      } as any).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await admin.from("company_addons").insert({
        company_id: userRow.company_id,
        addon_id: addonId,
        is_enabled: enabled,
        enabled_at: enabled ? now : null,
        disabled_at: enabled ? null : now,
        created_at: now,
        updated_at: now,
      } as any);
      if (error) throw error;
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Could not update add-on" });
  }
}
