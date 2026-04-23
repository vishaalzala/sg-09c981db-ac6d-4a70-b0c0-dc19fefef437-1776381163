import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized, user } = await verifyAdmin(req);
  if (!authorized) return res.status(403).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { companyId, action, reason, days = 14 } = req.body || {};
  if (!companyId || !action) return res.status(400).json({ error: "companyId and action are required" });
  if (["impersonate", "suspend", "cancel_subscription"].includes(action) && !String(reason || "").trim()) {
    return res.status(400).json({ error: "Reason is required for this sensitive admin action" });
  }

  try {
    let result: any = null;
    if (action === "suspend") {
      const { data, error } = await supabase.from("companies").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", companyId).select().single();
      if (error) throw error;
      await supabase.from("company_subscriptions").update({ status: "suspended", updated_at: new Date().toISOString() }).eq("company_id", companyId);
      result = data;
    } else if (action === "reactivate") {
      const { data, error } = await supabase.from("companies").update({ is_active: true, updated_at: new Date().toISOString() }).eq("id", companyId).select().single();
      if (error) throw error;
      await supabase.from("company_subscriptions").update({ status: "active", paused_at: null, resumes_at: null, updated_at: new Date().toISOString() }).eq("company_id", companyId);
      result = data;
    } else if (action === "pause_subscription") {
      const resumes = new Date();
      resumes.setDate(resumes.getDate() + Number(days || 30));
      const { data, error } = await supabase.from("company_subscriptions").update({ status: "paused", paused_at: new Date().toISOString(), resumes_at: resumes.toISOString(), updated_at: new Date().toISOString() }).eq("company_id", companyId).select().maybeSingle();
      if (error) throw error;
      result = data;
    } else if (action === "cancel_subscription") {
      const { data, error } = await supabase.from("company_subscriptions").update({ status: "cancelled", cancel_at_period_end: true, updated_at: new Date().toISOString() }).eq("company_id", companyId).select().maybeSingle();
      if (error) throw error;
      result = data;
    } else if (action === "extend_trial") {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + Number(days || 14));
      const { data, error } = await supabase.from("company_subscriptions").update({ status: "trial_active", trial_ends_at: trialEnd.toISOString(), updated_at: new Date().toISOString() }).eq("company_id", companyId).select().maybeSingle();
      if (error) throw error;
      result = data;
    } else if (action === "impersonate") {
      result = { message: "Impersonation request logged. Token handoff must be wired to your auth layer next." };
    } else {
      return res.status(400).json({ error: "Unsupported action" });
    }

    await supabase.from("audit_logs").insert({ user_id: user?.id, company_id: companyId, action_type: action, entity_type: "company", entity_id: companyId, metadata: { reason, days } } as any);
    return res.status(200).json({ ok: true, result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Admin action failed" });
  }
}
