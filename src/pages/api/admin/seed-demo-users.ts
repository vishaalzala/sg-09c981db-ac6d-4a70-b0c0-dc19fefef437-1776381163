import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get demo company
    const { data: demoCompany } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("name", "Demo Workshop NZ")
      .single();

    if (!demoCompany) {
      return res.status(404).json({ error: "Demo company not found" });
    }

    // Get roles
    const { data: ownerRole } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "owner")
      .single();

    const { data: staffRole } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "staff")
      .single();

    const { data: inspectorRole } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "inspector")
      .single();

    const demoUsers = [
      {
        email: "owner@demo.com",
        password: "demo123",
        full_name: "Demo Owner",
        role_id: ownerRole?.id,
        role_name: "owner"
      },
      {
        email: "staff@demo.com",
        password: "demo123",
        full_name: "Demo Staff",
        role_id: staffRole?.id,
        role_name: "staff"
      },
      {
        email: "inspector@demo.com",
        password: "demo123",
        full_name: "Demo Inspector",
        role_id: inspectorRole?.id,
        role_name: "inspector"
      }
    ];

    const createdUsers = [];

    for (const user of demoUsers) {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name
        }
      });

      if (authError) {
        console.error(`Failed to create ${user.email}:`, authError);
        continue;
      }

      if (authUser.user) {
        // Create profile
        await supabaseAdmin
          .from("profiles")
          .insert({
            id: authUser.user.id,
            role: user.role_name,
            full_name: user.full_name
          });

        // Create users record
        await supabaseAdmin
          .from("users")
          .insert({
            id: authUser.user.id,
            company_id: demoCompany.id,
            email: user.email,
            full_name: user.full_name,
            role_id: user.role_id
          });

        createdUsers.push(user.email);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Created ${createdUsers.length} demo users: ${createdUsers.join(", ")}`,
      users: createdUsers
    });

  } catch (error) {
    console.error("Error seeding demo users:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to seed demo users"
    });
  }
}