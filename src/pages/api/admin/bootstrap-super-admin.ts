import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    assertServiceRoleConfigured();
    const supabaseAdmin = getSupabaseAdmin();

    const token = (req.body as { token?: string } | null)?.token ?? null;
    const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN ?? "";

    if (!expectedToken) {
      return res.status(500).json({ error: "Missing ADMIN_BOOTSTRAP_TOKEN" });
    }

    if (!token || token !== expectedToken) {
      return res.status(401).json({ error: "Invalid bootstrap token" });
    }

    const authHeader = req.headers.authorization ?? "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
    if (!accessToken) {
      return res.status(401).json({ error: "MISSING_TOKEN" });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData.user) {
      return res.status(401).json({ error: "INVALID_TOKEN" });
    }

    const userId = userData.user.id;
    const email = userData.user.email ?? null;

    const { data: existingAdmin, error: existingAdminError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1);

    if (existingAdminError) {
      console.error("bootstrap-super-admin super admin lookup error:", existingAdminError);
      return res.status(500).json({ error: "Failed to check existing super admins" });
    }

    if ((existingAdmin ?? []).length > 0) {
      return res.status(409).json({ error: "Super admin already exists" });
    }

    const { error: profileUpsertError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, email, role: "super_admin", company_id: null } as any, { onConflict: "id" });

    if (profileUpsertError) {
      console.error("bootstrap-super-admin profiles upsert error:", profileUpsertError);
      return res.status(500).json({ error: "Failed to update profile" });
    }

    const { error: userRowUpsertError } = await supabaseAdmin
      .from("users")
      .upsert({ id: userId, email, role: "super_admin", company_id: null } as any, { onConflict: "id" });

    if (userRowUpsertError) {
      console.error("bootstrap-super-admin users upsert error:", userRowUpsertError);
      return res.status(500).json({ error: "Failed to update users row" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}