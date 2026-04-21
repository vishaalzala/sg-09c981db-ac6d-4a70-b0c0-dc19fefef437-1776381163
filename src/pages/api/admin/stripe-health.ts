import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let tablesReady = false;
    if (isServiceRoleConfigured()) {
      const admin = getSupabaseAdmin();
      const [subsResult, eventsResult] = await Promise.all([
        (admin as any).from("subscriptions").select("id", { count: "exact", head: true }),
        (admin as any).from("billing_events").select("id", { count: "exact", head: true }),
      ]);
      tablesReady = !subsResult.error && !eventsResult.error;
    }

    return res.status(200).json({
      secretKeyConfigured: isStripeConfigured(),
      webhookSecretConfigured: isStripeWebhookConfigured(),
      tablesReady,
    });
  } catch (error) {
    console.error("stripe-health error", error);
    return res.status(200).json({
      secretKeyConfigured: isStripeConfigured(),
      webhookSecretConfigured: isStripeWebhookConfigured(),
      tablesReady: false,
    });
  }
}
