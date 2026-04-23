import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

const PLAN_FIELDS = [
  "name", "display_name", "description", "price_monthly", "price_annual", "trial_days",
  "max_users", "max_branches", "features", "is_active", "is_public", "show_on_homepage",
  "show_on_pricing", "sort_order"
];

function sanitizePlanPayload(body: Record<string, any>) {
  return PLAN_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) acc[key] = body[key];
    return acc;
  }, {} as Record<string, any>);
}

async function syncPlanAddons(supabase: any, planId: string, addonIds: string[] | undefined) {
  if (!Array.isArray(addonIds)) return;
  await supabase.from("plan_addons").delete().eq("plan_id", planId);
  const rows = addonIds.filter(Boolean).map((addonId) => ({ plan_id: planId, addon_id: addonId, is_included: true }));
  if (rows.length) {
    const { error } = await supabase.from("plan_addons").insert(rows);
    if (error) throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized, user } = await verifyAdmin(req);
  if (!authorized) return res.status(403).json({ error: "Unauthorized" });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    if (req.method === "POST") {
      const { add_on_ids, ...body } = req.body || {};
      const { data, error } = await supabase.from("subscription_plans").insert(sanitizePlanPayload(body)).select().single();
      if (error) throw error;
      await syncPlanAddons(supabase, data.id, add_on_ids);
      await supabase.from("audit_logs").insert({ user_id: user?.id, action_type: "plan_create", entity_type: "subscription_plan", entity_id: data.id, metadata: { add_on_ids } } as any);
      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const { id, add_on_ids, ...body } = req.body || {};
      if (!id) return res.status(400).json({ error: "Missing id" });
      const { data, error } = await supabase.from("subscription_plans").update({ ...sanitizePlanPayload(body), updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      await syncPlanAddons(supabase, id, add_on_ids);
      await supabase.from("audit_logs").insert({ user_id: user?.id, action_type: "plan_update", entity_type: "subscription_plan", entity_id: id, metadata: { add_on_ids } } as any);
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to manage plan" });
  }
}
