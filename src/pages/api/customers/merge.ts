import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const RELATED_TABLES = ["vehicles", "jobs", "invoices", "quotes", "payments"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const admin = getSupabaseAdmin();
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing auth token" });
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: "Invalid session" });

    const { sourceCustomerId, targetCustomerId } = req.body;
    if (!sourceCustomerId || !targetCustomerId || sourceCustomerId === targetCustomerId) {
      return res.status(400).json({ error: "Source and target customer are required and must be different" });
    }

    const { data: userRow } = await admin.from("users").select("company_id").eq("id", user.id).single();
    if (!userRow?.company_id) return res.status(403).json({ error: "No company found" });
    const companyId = userRow.company_id;

    const { data: source } = await admin.from("customers").select("id").eq("id", sourceCustomerId).eq("company_id", companyId).single();
    const { data: target } = await admin.from("customers").select("id").eq("id", targetCustomerId).eq("company_id", companyId).single();
    if (!source || !target) return res.status(404).json({ error: "Customer not found" });

    const changes: Record<string, number | string> = {};
    for (const table of RELATED_TABLES) {
      const { data, error } = await admin.from(table).update({ customer_id: targetCustomerId }).eq("company_id", companyId).eq("customer_id", sourceCustomerId).select("id");
      if (error) throw error;
      changes[table] = data?.length || 0;
    }

    const now = new Date().toISOString();
    await admin.from("customers").update({ deleted_at: now, updated_at: now }).eq("id", sourceCustomerId).eq("company_id", companyId);
    await admin.from("customer_merge_logs").insert({ company_id: companyId, source_customer_id: sourceCustomerId, target_customer_id: targetCustomerId, merged_by: user.id, changes, created_at: now });
    await admin.from("audit_logs").insert({ company_id: companyId, user_id: user.id, action_type: "customer_merged", entity_type: "customer", entity_id: targetCustomerId, metadata: { sourceCustomerId, targetCustomerId, changes }, created_at: now }).then(() => null).catch(() => null);

    return res.status(200).json({ ok: true, changes });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Could not merge customers" });
  }
}
