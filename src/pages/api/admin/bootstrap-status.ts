import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const serviceRoleConfigured = isServiceRoleConfigured();
  if (!serviceRoleConfigured) {
    return res.status(200).json({
      hasSuperAdmin: false,
      serviceRoleConfigured: false,
    });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1);

    if (error) {
      console.error("bootstrap-status query error:", error);
      return res.status(200).json({
        hasSuperAdmin: false,
        serviceRoleConfigured: true,
      });
    }

    return res.status(200).json({
      hasSuperAdmin: (data ?? []).length > 0,
      serviceRoleConfigured: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(200).json({
      hasSuperAdmin: false,
      serviceRoleConfigured,
      error: message,
    });
  }
}