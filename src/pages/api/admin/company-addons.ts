import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized, user } = await verifyAdmin(req);
  if (!authorized) return res.status(403).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const { companyId, addonId, enabled } = req.body || {};
    if (!companyId || !addonId || typeof enabled !== "boolean") return res.status(400).json({ error: "companyId, addonId and enabled are required" });

    const { data: existing } = await supabase
      .from("company_addons")
      .select("id")
      .eq("company_id", companyId)
      .eq("addon_id", addonId)
      .maybeSingle();

    let result: any = null;
    if (existing?.id) {
      const { data, error } = await supabase
        .from("company_addons")
        .update({
          is_enabled: enabled,
          enabled_at: enabled ? new Date().toISOString() : null,
          disabled_at: enabled ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("company_addons")
        .insert({
          company_id: companyId,
          addon_id: addonId,
          is_enabled: enabled,
          enabled_at: enabled ? new Date().toISOString() : null,
          disabled_at: enabled ? null : new Date().toISOString(),
        } as any)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await supabase.from("audit_logs").insert({
      user_id: user?.id,
      company_id: companyId,
      action_type: enabled ? "addon_enabled" : "addon_disabled",
      entity_type: "company_addon",
      entity_id: result.id,
      metadata: { addonId, enabled }
    } as any);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update company add-on" });
  }
}
