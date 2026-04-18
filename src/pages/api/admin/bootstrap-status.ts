import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check for super_admin profiles ONLY (no roles table dependency)
    const { data: superAdmins, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "super_admin");

    if (error) {
      console.error("Bootstrap status check error:", error);
      throw error;
    }

    const superAdminExists = !!(superAdmins && superAdmins.length > 0);

    console.log("Bootstrap status:", {
      superAdminExists,
      count: superAdmins?.length || 0
    });

    return res.status(200).json({
      roleExists: true, // profiles.role column exists
      superAdminExists,
      count: superAdmins?.length || 0
    });

  } catch (error) {
    console.error("Bootstrap status error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to check bootstrap status"
    });
  }
}