import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Check if super admin exists

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check for super admin role
    const { data: superAdminRole } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "super_admin")
      .single();

    if (!superAdminRole) {
      return res.status(200).json({
        roleExists: false,
        superAdminExists: false
      });
    }

    // Check for any users with super admin role
    const { data: superAdmins } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("role_id", superAdminRole.id);

    return res.status(200).json({
      roleExists: true,
      superAdminExists: (superAdmins && superAdmins.length > 0),
      count: superAdmins?.length || 0
    });

  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to check status"
    });
  }
}