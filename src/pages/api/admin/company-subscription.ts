import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized, user } = await verifyAdmin(req);
  if (!authorized) return res.status(403).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const { companyId, planId, billing_cycle = "monthly", status = "active", trial_ends_at = null } = req.body || {};
    if (!companyId || !planId) return res.status(400).json({ error: "companyId and planId are required" });

    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id, price_monthly, price_annual, trial_days")
      .eq("id", planId)
      .single();
    if (planError || !plan) return res.status(400).json({ error: "Selected plan does not exist" });

    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    if (billing_cycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscriptionData: any = {
      company_id: companyId,
      plan_id: planId,
      status,
      billing_cycle,
      trial_ends_at,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      next_billing_date: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("company_subscriptions")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle();

    let result;
    if (existing?.id) {
      const { data, error } = await supabase
        .from("company_subscriptions")
        .update(subscriptionData)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("company_subscriptions")
        .insert(subscriptionData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    const { data: includedAddons } = await supabase
      .from("plan_addons")
      .select("addon_id")
      .eq("plan_id", planId)
      .eq("is_included", true);

    const addonRows = (includedAddons || []).map((row: any) => ({
      company_id: companyId,
      addon_id: row.addon_id,
      is_enabled: true,
      enabled_at: new Date().toISOString(),
      disabled_at: null,
      source: "plan",
    }));

    if (addonRows.length) await supabase.from("company_addons").upsert(addonRows, { onConflict: "company_id,addon_id" });

    await supabase.from("audit_logs").insert({
      user_id: user?.id,
      company_id: companyId,
      action_type: existing?.id ? "subscription_update" : "subscription_create",
      entity_type: "company_subscription",
      entity_id: result.id,
      metadata: { planId, billing_cycle, status, included_addons: addonRows.map((row: any) => row.addon_id) }
    } as any);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to assign subscription" });
  }
}
