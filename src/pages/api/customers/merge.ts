import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const tablesToMove = ["vehicles", "jobs", "invoices", "quotes", "payments", "bookings", "customer_notes", "customer_contacts"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const admin = getSupabaseAdmin();
    const token = String(req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const { data: auth } = await admin.auth.getUser(token);
    if (!auth.user) return res.status(401).json({ error: "Invalid session" });

    const { mergeFromId, mergeToId } = req.body || {};
    if (!mergeFromId || !mergeToId || mergeFromId === mergeToId) {
      return res.status(400).json({ error: "Select two different customers to merge" });
    }

    const { data: userRow } = await admin.from("users").select("company_id").eq("id", auth.user.id).single();
    if (!userRow?.company_id) return res.status(403).json({ error: "No company found" });

    const { data: customers, error: customerError } = await admin
      .from("customers")
      .select("id, company_id")
      .in("id", [mergeFromId, mergeToId])
      .eq("company_id", userRow.company_id);
    if (customerError) throw customerError;
    if ((customers || []).length !== 2) return res.status(404).json({ error: "Both customers must exist in your company" });

    for (const table of tablesToMove) {
      await admin.from(table).update({ customer_id: mergeToId } as any).eq("customer_id", mergeFromId).eq("company_id", userRow.company_id).then(() => null).catch(() => null);
    }

    const now = new Date().toISOString();
    await admin.from("customers").update({ deleted_at: now, updated_at: now } as any).eq("id", mergeFromId).eq("company_id", userRow.company_id);

    await admin.from("audit_logs").insert({
      company_id: userRow.company_id,
      user_id: auth.user.id,
      action: "customer_merged",
      entity_type: "customer",
      entity_id: mergeToId,
      metadata: { merge_from_id: mergeFromId, merge_to_id: mergeToId },
      created_at: now,
    } as any).then(() => null).catch(() => null);

    return res.status(200).json({ ok: true, survivingCustomerId: mergeToId });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Customer merge failed" });
  }
}
