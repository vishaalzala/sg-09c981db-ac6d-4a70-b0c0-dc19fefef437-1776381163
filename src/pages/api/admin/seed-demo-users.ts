import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Seeding demo users for company:", companyId);

    // Demo users with role strings (NO roles table dependency)
    const demoUsers = [
      {
        email: "owner@demo.com",
        password: "Demo123!",
        full_name: "Demo Owner",
        role: "owner"
      },
      {
        email: "manager@demo.com",
        password: "Demo123!",
        full_name: "Demo Manager",
        role: "branch_manager"
      },
      {
        email: "advisor@demo.com",
        password: "Demo123!",
        full_name: "Demo Service Advisor",
        role: "service_advisor"
      },
      {
        email: "tech@demo.com",
        password: "Demo123!",
        full_name: "Demo Technician",
        role: "technician"
      },
      {
        email: "inspector@demo.com",
        password: "Demo123!",
        full_name: "Demo WOF Inspector",
        role: "wof_inspector"
      },
      {
        email: "parts@demo.com",
        password: "Demo123!",
        full_name: "Demo Parts Manager",
        role: "parts_manager"
      }
    ];

    const createdUsers = [];

    for (const user of demoUsers) {
      try {
        console.log(`Creating demo user: ${user.email} with role: ${user.role}`);

        // 1. Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name
          }
        });

        if (authError) {
          console.error(`Failed to create auth user ${user.email}:`, authError);
          continue;
        }

        if (!authData.user) {
          console.error(`No user returned for ${user.email}`);
          continue;
        }

        // 2. Create profile with role string (NO role_id dependency)
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: authData.user.id,
            role: user.role,
            full_name: user.full_name,
            email: user.email
          });

        if (profileError) {
          console.error(`Failed to create profile for ${user.email}:`, profileError);
          continue;
        }

        // 3. Create users record with company_id (NO role_id dependency)
        const { error: userError } = await supabaseAdmin
          .from("users")
          .insert({
            id: authData.user.id,
            company_id: companyId,
            email: user.email,
            full_name: user.full_name
          });

        if (userError) {
          console.error(`Failed to create user record for ${user.email}:`, userError);
          continue;
        }

        console.log(`Successfully created demo user: ${user.email}`);
        createdUsers.push({
          email: user.email,
          role: user.role,
          userId: authData.user.id
        });

      } catch (err) {
        console.error(`Error creating user ${user.email}:`, err);
      }
    }

    console.log(`Demo users seeded: ${createdUsers.length}/${demoUsers.length}`);

    return res.status(200).json({
      success: true,
      message: `Successfully created ${createdUsers.length} demo users`,
      users: createdUsers
    });

  } catch (error) {
    console.error("Seed demo users error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to seed demo users"
    });
  }
}