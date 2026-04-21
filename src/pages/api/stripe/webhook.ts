import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Missing STRIPE_WEBHOOK_SECRET" });
  }

  try {
    const rawBody = await readRawBody(req);
    const stripe = getStripeServer();
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (isServiceRoleConfigured()) {
      const admin = getSupabaseAdmin();
      const objectData = (event.data?.object || {}) as Record<string, any>;
      const subscriptionId = typeof objectData.id === "string" && objectData.object === "subscription" ? objectData.id : (objectData.subscription as string | undefined) || null;
      const customerId = typeof objectData.customer === "string" ? objectData.customer : null;

      await (admin as any).from("billing_events").insert({
        stripe_event_id: event.id,
        event_type: event.type,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        payload: event,
        processing_status: "received",
      });

      if (event.type.startsWith("customer.subscription.")) {
        const subscription = objectData as Stripe.Subscription;
        await (admin as any).from("subscriptions").upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
          status: subscription.status,
          current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
          current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          raw_data: subscription,
        }, { onConflict: "stripe_subscription_id" });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return res.status(400).json({ error: error instanceof Error ? error.message : "Webhook failed" });
  }
}
