import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized } = await verifyAdmin(req);
  if (!authorized) return res.status(403).json({ error: "Unauthorized" });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  try {
    if (req.method === "POST") {
      const { data, error } = await supabase.from("addon_catalog").insert(req.body).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: "Missing id" });
      const { data, error } = await supabase.from("addon_catalog").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to manage add-on" });
  }
}
