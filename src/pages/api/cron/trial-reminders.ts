import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const admin = getSupabaseAdmin();
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  try {
    const { data: trials, error } = await admin
      .from("company_subscriptions")
      .select("id, company_id, trial_ends_at, status")
      .in("status", ["trial_active", "trialing"])
      .gte("trial_ends_at", now.toISOString())
      .lte("trial_ends_at", soon.toISOString());

    if (error) throw error;
    let sent = 0;

    for (const trial of trials || []) {
      const { data: owner } = await admin
        .from("users")
        .select("email, full_name")
        .eq("company_id", trial.company_id)
        .in("role", ["owner", "company_owner", "admin"])
        .limit(1)
        .maybeSingle();

      if (!owner?.email) continue;

      const html = `<h1>Your WorkshopPro trial is ending soon</h1><p>Your trial ends on ${new Date(trial.trial_ends_at).toLocaleDateString()}.</p><p>Please choose a paid plan to continue uninterrupted.</p>`;

      await admin.from("communications").insert({
        company_id: trial.company_id,
        channel: "email",
        direction: "outbound",
        event_type: "trial_expiry_warning",
        recipient: owner.email,
        subject: "Your WorkshopPro trial is ending soon",
        body: html,
        status: "queued",
        metadata: { subscription_id: trial.id },
      } as any);

      sent++;
    }

    return res.status(200).json({ ok: true, queued: sent });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Trial reminder failed" });
  }
}
