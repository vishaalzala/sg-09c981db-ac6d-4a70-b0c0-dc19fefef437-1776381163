import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const admin = getSupabaseAdmin();
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing auth token" });
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: "Invalid session" });

    const { customerId, recipientEmail, message } = req.body;
    if (!customerId) return res.status(400).json({ error: "Missing customerId" });

    const { data: userRow } = await admin.from("users").select("company_id").eq("id", user.id).single();
    if (!userRow?.company_id) return res.status(403).json({ error: "No company found" });

    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("id, name, email")
      .eq("id", customerId)
      .eq("company_id", userRow.company_id)
      .single();
    if (customerError || !customer) return res.status(404).json({ error: "Customer not found" });

    const to = recipientEmail || customer.email;
    if (!to) return res.status(400).json({ error: "Customer has no email address" });

    const now = new Date().toISOString();
    const { data: history, error } = await admin.from("document_history").insert({
      company_id: userRow.company_id,
      customer_id: customer.id,
      document_type: "customer_statement",
      document_id: customer.id,
      action: "email_statement",
      recipient_email: to,
      subject: `Customer Statement - ${customer.name || "Customer"}`,
      message: message || "Customer statement queued for email delivery.",
      status: "queued",
      sent_by: user.id,
      created_at: now,
      metadata: { customer_name: customer.name }
    }).select("id").single();
    if (error) throw error;

    await admin.from("communications").insert({
      company_id: userRow.company_id,
      customer_id: customer.id,
      channel: "email",
      communication_type: "statement",
      template_type: "customer_statement",
      recipient: to,
      subject: `Customer Statement - ${customer.name || "Customer"}`,
      body: message || "Customer statement queued for email delivery.",
      status: "queued",
      related_entity_type: "customer",
      related_entity_id: customer.id,
      created_at: now,
      metadata: { document_history_id: history.id }
    }).then(() => null).catch(() => null);

    return res.status(200).json({ ok: true, documentHistoryId: history.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Could not queue statement" });
  }
}
