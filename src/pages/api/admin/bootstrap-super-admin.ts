import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, token } = req.body;

    // Verify bootstrap token
    if (token !== process.env.ADMIN_BOOTSTRAP_TOKEN) {
      return res.status(403).json({ error: "Invalid bootstrap token" });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Creating bootstrap super admin:", email);

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Super Admin"
      }
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Failed to create auth user");
    }

    console.log("Auth user created:", authData.user.id);

    // Insert profile with role = "super_admin" (NO role_id dependency)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "super_admin",
        full_name: "Super Admin",
        email
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw profileError;
    }

    console.log("Profile created with super_admin role");

    // Insert user record (NO role_id, NO company_id for super admin)
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name: "Super Admin"
      });

    if (userError) {
      console.error("User record creation error:", userError);
      // Don't throw - profile is created, which is what matters for auth
    }

    console.log("Bootstrap super admin created successfully");

    return res.status(200).json({
      success: true,
      userId: authData.user.id,
      message: "Super admin created successfully"
    });

  } catch (error) {
    console.error("Bootstrap super admin error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create super admin"
    });
  }
}