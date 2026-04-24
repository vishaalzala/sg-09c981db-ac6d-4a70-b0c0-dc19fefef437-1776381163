import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getStripeServer } from "@/lib/stripe";
import { getSupabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";

export const config = { api: { bodyParser: false } };

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") return res.status(400).json({ error: "Missing stripe-signature header" });
    if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).json({ error: "Missing STRIPE_WEBHOOK_SECRET" });

    try {
        const rawBody = await readRawBody(req);
        const stripe = getStripeServer();
        const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

        if (isServiceRoleConfigured()) {
            const admin = getSupabaseAdmin();
            const objectData = (event.data?.object || {}) as Record<string, any>;
            const customerId = typeof objectData.customer === "string" ? objectData.customer : null;
            const subscriptionId = typeof objectData.id === "string" && objectData.object === "subscription" ? objectData.id : (objectData.subscription as string | undefined) || null;

            await (admin as any).from("billing_events").insert({
                stripe_event_id: event.id,
                event_type: event.type,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                amount: objectData.amount_paid ? Number(objectData.amount_paid) / 100 : objectData.amount_due ? Number(objectData.amount_due) / 100 : null,
                currency: objectData.currency || null,
                status: objectData.status || null,
                payload: event,
                processing_status: "received",
            }).then(() => null).catch(() => null);

            if (event.type === "invoice.payment_failed") {
                const invoice = event.data.object as Stripe.Invoice;
                const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : null;
                if (stripeCustomerId) {
                    await admin.from("company_subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
                    const { data: sub } = await admin.from("company_subscriptions").select("company_id").eq("stripe_customer_id", stripeCustomerId).maybeSingle();
                    if (sub?.company_id) {
                        await admin.from("communications").insert({ company_id: sub.company_id, channel: "email", event_type: "payment_failed", recipient: "billing-owner", subject: "Payment failed", body: "Stripe payment failed. Dunning workflow should notify the owner.", status: "queued", metadata: { stripe_invoice_id: invoice.id } } as any).then(() => null).catch(() => null);
                    }
                }
            }

            if (event.type === "invoice.paid") {
                const invoice = event.data.object as Stripe.Invoice;
                const stripeCustomerId = typeof invoice.customer === "string" ? invoice.customer : null;
                if (stripeCustomerId) {
                    await admin.from("company_subscriptions").update({ status: "active", last_payment_at: new Date().toISOString(), last_payment_amount: Number(invoice.amount_paid || 0) / 100, updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
                }
            }

            if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
                const sub = event.data.object as Stripe.Subscription;
                const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : null;
                await admin.from("company_subscriptions").update({
                    status: sub.status,
                    stripe_subscription_id: sub.id,
                    current_period_start: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null,
                    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
                    updated_at: new Date().toISOString(),
                } as any).eq("stripe_customer_id", stripeCustomerId);
            }

            if (event.type === "customer.subscription.deleted") {
                const sub = event.data.object as Stripe.Subscription;
                const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : null;
                if (stripeCustomerId) {
                    await admin.from("company_subscriptions").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
                    await admin.from("companies").update({ is_active: false, updated_at: new Date().toISOString() }).eq("stripe_customer_id", stripeCustomerId);
                }
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Stripe webhook error", error);
        return res.status(400).json({ error: error instanceof Error ? error.message : "Webhook failed" });
    }
}
