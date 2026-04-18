import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { company, owner, subscription, addons, branch } = req.body;

    // 1. Create company
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        is_active: company.is_active
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // 2. Create auth user (owner)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: owner.email,
      password: owner.password,
      email_confirm: true,
      user_metadata: {
        full_name: owner.full_name
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user");

    // 3. Get owner role
    const { data: ownerRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "owner")
      .single();

    // 4. Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "owner",
        full_name: owner.full_name
      });

    if (profileError) throw profileError;

    // 5. Create users record
    const { error: usersError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        company_id: companyData.id,
        email: owner.email,
        full_name: owner.full_name,
        role_id: ownerRole?.id
      });

    if (usersError) throw usersError;

    // 6. Get plan
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", "free_trial")
      .single();

    // 7. Create subscription
    if (plan) {
      const trialStart = new Date();
      const trialEnd = new Date();
      
      if (subscription.type === "trial") {
        trialEnd.setDate(trialEnd.getDate() + subscription.trial_days);
      } else {
        trialEnd.setMonth(trialEnd.getMonth() + 1);
      }

      await supabase
        .from("company_subscriptions")
        .insert({
          company_id: companyData.id,
          plan_id: plan.id,
          status: subscription.type === "trial" ? "trial_active" : "active",
          trial_ends_at: subscription.type === "trial" ? trialEnd.toISOString() : null,
          current_period_start: trialStart.toISOString(),
          current_period_end: trialEnd.toISOString()
        });
    }

    // 8. Assign add-ons
    if (addons && addons.length > 0) {
      const { data: addonsCatalog } = await supabase
        .from("addon_catalog")
        .select("id, slug")
        .in("slug", addons.map((a: string) => a));

      if (addonsCatalog) {
        const addonInserts = addonsCatalog.map(addon => ({
          company_id: companyData.id,
          addon_id: addon.id,
          is_enabled: true
        }));

        await supabase
          .from("company_addons")
          .insert(addonInserts);
      }
    }

    // 9. Create branch if requested
    if (branch) {
      await supabase
        .from("branches")
        .insert({
          company_id: companyData.id,
          name: branch.name,
          email: branch.email,
          phone: branch.phone,
          address: branch.address,
          is_active: true
        });
    }

    return res.status(200).json({
      success: true,
      companyId: companyData.id,
      userId: authData.user.id
    });

  } catch (error) {
    console.error("Create company error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create company"
    });
  }
}