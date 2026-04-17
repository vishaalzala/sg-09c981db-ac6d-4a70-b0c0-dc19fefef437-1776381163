import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    await requireSuperAdmin(req);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, is_active")
      .order("name", { ascending: true });

    if (error) {
      console.error("Admin list companies error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ companies: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "MISSING_TOKEN" ? 401 : message === "INVALID_TOKEN" ? 401 : message === "NOT_SUPER_ADMIN" ? 403 : 500;
    return res.status(status).json({ error: message });
  }
}