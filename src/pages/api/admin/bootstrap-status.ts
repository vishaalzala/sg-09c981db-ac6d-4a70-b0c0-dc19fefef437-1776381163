import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    assertServiceRoleConfigured();

    const { count, error } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (error) {
      console.error("Bootstrap status check error:", error);
      return res.status(500).json({ error: "Failed to check bootstrap status" });
    }

    return res.status(200).json({
      hasSuperAdmin: (count ?? 0) > 0,
      serviceRoleConfigured: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const serviceRoleConfigured = message !== "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in Vercel environment variables (server-side only).";

    return res.status(200).json({
      hasSuperAdmin: false,
      serviceRoleConfigured,
    });
  }
}