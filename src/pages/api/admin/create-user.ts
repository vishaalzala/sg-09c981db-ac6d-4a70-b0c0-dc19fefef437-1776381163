import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // NEW PAYLOAD FORMAT: role string instead of roleId
    const { email, password, fullName, companyId, role } = req.body;

    // Validation
    if (!email || !password || !fullName || !companyId || !role) {
      return res.status(400).json({ 
        error: "Missing required fields: email, password, fullName, companyId, role" 
      });
    }

    // Validate role is a string
    if (typeof role !== "string") {
      return res.status(400).json({ 
        error: "Role must be a string (e.g., 'owner', 'admin', 'staff')" 
      });
    }

    console.log("Creating user:", { email, fullName, companyId, role });

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("No user returned from auth creation");
    }

    console.log("Auth user created:", authData.user.id);

    // 2. Create profile with role string (NO role_id dependency)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        role,
        full_name: fullName,
        email
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log("Profile created with role:", role);

    // 3. Create users record with company_id (NO role_id dependency)
    const { error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: companyId,
        email,
        full_name: fullName
      });

    if (userError) {
      console.error("User record creation error:", userError);
      throw new Error(`Failed to create user record: ${userError.message}`);
    }

    console.log("User record created");

    return res.status(200).json({
      success: true,
      userId: authData.user.id,
      message: "User created successfully"
    });

  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create user"
    });
  }
}