import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// This endpoint creates the initial super admin user
// Use with caution - should only be run once during setup

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, bootstrapToken } = req.body;

  // Verify bootstrap token (set in environment)
  if (bootstrapToken !== process.env.ADMIN_BOOTSTRAP_TOKEN) {
    return res.status(401).json({ error: "Invalid bootstrap token" });
  }

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    // Use service role key for admin operations
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

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Super Admin"
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    // 2. Get super admin role
    const { data: superAdminRole } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "super_admin")
      .single();

    if (!superAdminRole) {
      throw new Error("Super admin role not found");
    }

    // 3. Create profile with super_admin role
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "super_admin",
        full_name: "Super Admin"
      });

    if (profileError) throw profileError;

    // 4. Create users record (no company_id for super admin)
    const { error: usersError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name: "Super Admin",
        role_id: superAdminRole.id
      });

    if (usersError) throw usersError;

    return res.status(200).json({
      success: true,
      message: "Super admin created successfully",
      userId: authData.user.id
    });

  } catch (error) {
    console.error("Bootstrap error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to bootstrap super admin"
    });
  }
}