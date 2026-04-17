import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "@/pages/api/admin/_auth";

interface CompanyListItem {
  id: string;
  name: string;
  is_active: boolean | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    await requireSuperAdmin(req);

    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, is_active")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (error) {
      console.error("Admin companies list error:", error);
      return res.status(500).json({ error: "Failed to load companies" });
    }

    const companies: CompanyListItem[] = (data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      is_active: c.is_active,
    }));

    return res.status(200).json({ companies });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status =
      message === "MISSING_TOKEN" || message === "INVALID_TOKEN" ? 401 : message === "NOT_SUPER_ADMIN" ? 403 : 500;

    return res.status(status).json({ error: message });
  }
}