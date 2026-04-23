import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized, user } = await verifyAdmin(req);
  if (!authorized) return res.status(403).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { companyId, newPassword, reason } = req.body || {};
  if (!companyId || !newPassword) return res.status(400).json({ error: "companyId and newPassword are required" });
  if (String(newPassword).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  if (!String(reason || "").trim()) return res.status(400).json({ error: "Reason is required for password reset" });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const { data: companyUsers, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });
    if (userError) throw userError;
    if (!companyUsers?.length) return res.status(404).json({ error: "No company users found" });

    const ids = companyUsers.map((u: any) => u.id);
    const { data: profiles } = await supabase.from("profiles").select("id, role").in("id", ids);
    const ownerProfile = (profiles || []).find((p: any) => ["owner", "company_owner", "admin"].includes(p.role));
    const owner = companyUsers.find((u: any) => u.id === ownerProfile?.id) || companyUsers[0];

    const { error } = await supabase.auth.admin.updateUserById(owner.id, { password: newPassword });
    if (error) throw error;

    await supabase.from("audit_logs").insert({ user_id: user?.id, company_id: companyId, action_type: "owner_password_reset", entity_type: "user", entity_id: owner.id, metadata: { reason, owner_email: owner.email } } as any);
    return res.status(200).json({ ok: true, ownerEmail: owner.email });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Password reset failed" });
  }
}
