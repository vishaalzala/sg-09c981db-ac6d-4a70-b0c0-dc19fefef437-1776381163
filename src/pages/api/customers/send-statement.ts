import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const admin = getSupabaseAdmin();
    const token = String(req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const { data: userResult, error: authError } = await admin.auth.getUser(token);
    if (authError || !userResult.user) return res.status(401).json({ error: "Invalid session" });

    const { customerId } = req.body || {};
    if (!customerId) return res.status(400).json({ error: "Missing customerId" });

    const { data: userRow } = await admin.from("users").select("company_id").eq("id", userResult.user.id).single();
    if (!userRow?.company_id) return res.status(403).json({ error: "No company found" });

    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("id, company_id, name, email")
      .eq("id", customerId)
      .eq("company_id", userRow.company_id)
      .single();
    if (customerError || !customer) return res.status(404).json({ error: "Customer not found" });
    if (!customer.email) return res.status(400).json({ error: "Customer has no email address" });

    const now = new Date().toISOString();
    const { data: history, error: historyError } = await admin.from("document_history").insert({
      company_id: userRow.company_id,
      customer_id: customer.id,
      document_type: "statement",
      action: "email_statement",
      recipient_email: customer.email,
      subject: `Statement for ${customer.name}`,
      message: "Customer statement queued for email delivery.",
      status: "queued",
      created_by: userResult.user.id,
      created_at: now,
      updated_at: now,
    } as any).select("id").single();

    if (historyError) throw historyError;

    await admin.from("communications").insert({
      company_id: userRow.company_id,
      customer_id: customer.id,
      channel: "email",
      direction: "outbound",
      event_type: "customer_statement",
      recipient: customer.email,
      subject: `Statement for ${customer.name}`,
      body: "Customer statement queued for email delivery.",
      status: "queued",
      created_by: userResult.user.id,
      metadata: { document_history_id: history.id },
    } as any).then(() => null).catch(() => null);

    return res.status(200).json({ ok: true, documentHistoryId: history.id, email: customer.email });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Statement queue failed" });
  }
}
