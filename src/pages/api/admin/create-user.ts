import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify admin access
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, password, fullName, companyId, roleId } = req.body;

  if (!email || !password || !fullName || !companyId || !roleId) {
    return res.status(400).json({ error: "Missing required fields" });
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

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("User creation failed");

    // 2. Get role name
    const { data: role } = await supabaseAdmin
      .from("roles")
      .select("name")
      .eq("id", roleId)
      .single();

    // 3. Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: role?.name || "staff",
        full_name: fullName
      });

    if (profileError) throw profileError;

    // 4. Create users record
    const { error: usersError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: companyId,
        email,
        full_name: fullName,
        role_id: roleId
      });

    if (usersError) throw usersError;

    return res.status(200).json({
      success: true,
      userId: authData.user.id
    });

  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create user"
    });
  }
}