import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseAdmin";

interface BootstrapBody {
  bootstrapToken: string;
  fullName?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    assertServiceRoleConfigured();

    const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN ?? "";
    const body = (req.body ?? {}) as Partial<BootstrapBody>;
    const providedToken = (body.bootstrapToken ?? "").trim();

    if (!expectedToken) {
      return res.status(500).json({ error: "Bootstrap token not configured" });
    }

    if (!providedToken || providedToken !== expectedToken) {
      return res.status(401).json({ error: "Invalid bootstrap token" });
    }

    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const { data: auth, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !auth.user) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    const requesterUserId = auth.user.id;
    const email = (auth.user.email ?? "").toLowerCase();
    const fullName = (body.fullName ?? auth.user.user_metadata?.full_name ?? "").toString().trim() || null;

    const { count, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (countError) {
      console.error("Bootstrap super admin count error:", countError);
      return res.status(500).json({ error: "Failed to check existing super admins" });
    }

    if ((count ?? 0) > 0) {
      return res.status(409).json({ error: "Super admin already exists" });
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: requesterUserId,
        email,
        full_name: fullName,
        role: "super_admin",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Bootstrap upsert profile error:", profileError);
      return res.status(500).json({ error: "Failed to promote profile" });
    }

    const { error: userRowError } = await supabaseAdmin.from("users").upsert(
      {
        id: requesterUserId,
        email,
        full_name: fullName,
        company_id: null,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (userRowError) {
      console.error("Bootstrap upsert users row error:", userRowError);
      return res.status(500).json({ error: "Failed to promote user record" });
    }

    await supabaseAdmin.from("audit_logs").insert({
      company_id: null,
      user_id: requesterUserId,
      action_type: "admin.bootstrap_super_admin",
      entity_type: "users",
      entity_id: requesterUserId,
      changes: { email },
    });

    return res.status(200).json({ ok: true, userId: requesterUserId, email });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}