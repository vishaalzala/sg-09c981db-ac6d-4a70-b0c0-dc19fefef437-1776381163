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

    console.log("Creating company:", { company, owner: { email: owner.email }, subscription, addons, branch });

    // 1. Create company
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        is_active: company.is_active ?? true
      })
      .select()
      .single();

    if (companyError) {
      console.error("Company creation error:", companyError);
      throw companyError;
    }

    console.log("Company created:", companyData.id);

    // 2. Create auth user (owner)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: owner.email,
      password: owner.password,
      email_confirm: true,
      user_metadata: {
        full_name: owner.full_name
      }
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      throw authError;
    }
    if (!authData.user) {
      console.error("Auth user creation failed - no user returned");
      throw new Error("Failed to create auth user");
    }

    console.log("Auth user created:", authData.user.id);

    // 3. Get owner role
    const { data: ownerRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "owner")
      .single();

    console.log("Owner role:", ownerRole?.id);

    // 4. Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        role: "owner",
        full_name: owner.full_name,
        email: owner.email
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw profileError;
    }

    console.log("Profile created");

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

    if (usersError) {
      console.error("Users record creation error:", usersError);
      throw usersError;
    }

    console.log("Users record created");

    // 6. Get plan
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("name", subscription.planName || "free_trial")
      .single();

    console.log("Plan found:", plan?.id);

    // 7. Create subscription
    if (plan) {
      const trialStart = new Date();
      const trialEnd = new Date();
      
      if (subscription.status === "trial_active") {
        trialEnd.setDate(trialEnd.getDate() + (subscription.trialDays || 14));
      } else {
        trialEnd.setMonth(trialEnd.getMonth() + 1);
      }

      const { error: subError } = await supabase
        .from("company_subscriptions")
        .insert({
          company_id: companyData.id,
          plan_id: plan.id,
          status: subscription.status || "trial_active",
          trial_ends_at: subscription.status === "trial_active" ? trialEnd.toISOString() : null,
          current_period_start: trialStart.toISOString(),
          current_period_end: trialEnd.toISOString(),
          billing_cycle: "monthly"
        });

      if (subError) {
        console.error("Subscription creation error:", subError);
        throw subError;
      }

      console.log("Subscription created");
    }

    // 8. Assign add-ons
    if (addons && addons.length > 0) {
      const { data: addonsCatalog } = await supabase
        .from("addon_catalog")
        .select("id, name")
        .in("name", addons);

      if (addonsCatalog && addonsCatalog.length > 0) {
        const addonInserts = addonsCatalog.map(addon => ({
          company_id: companyData.id,
          addon_id: addon.id,
          is_enabled: true
        }));

        const { error: addonsError } = await supabase
          .from("company_addons")
          .insert(addonInserts);

        if (addonsError) {
          console.error("Add-ons assignment error:", addonsError);
          // Don't throw - add-ons are optional
        } else {
          console.log("Add-ons assigned:", addonsCatalog.length);
        }
      }
    }

    // 9. Create branch if requested
    if (branch && branch.name) {
      const { error: branchError } = await supabase
        .from("branches")
        .insert({
          company_id: companyData.id,
          name: branch.name,
          email: branch.email,
          phone: branch.phone,
          address: branch.address,
          is_active: true,
          is_primary: true
        });

      if (branchError) {
        console.error("Branch creation error:", branchError);
        // Don't throw - branch is optional
      } else {
        console.log("Branch created");
      }
    }

    console.log("Company creation complete:", companyData.id);

    return res.status(200).json({
      success: true,
      companyId: companyData.id,
      userId: authData.user.id,
      message: "Company created successfully"
    });

  } catch (error) {
    console.error("Create company error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create company",
      details: error
    });
  }
}