import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin access
  const adminCheck = await verifyAdmin(req);
  if (!adminCheck.authorized) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (req.method === "GET") {
    try {
      const { data, error } = await supabaseAdmin
        .from("companies")
        .select(`
          *,
          subscription:company_subscriptions(
            *,
            plan:subscription_plans(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json({ companies: data });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch companies"
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, email, phone, address, planId } = req.body;

      // Create company
      const { data: company, error: companyError } = await supabaseAdmin
        .from("companies")
        .insert({
          name,
          email,
          phone,
          address,
          is_active: true
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create subscription if plan provided
      if (planId) {
        const { error: subError } = await supabaseAdmin
          .from("company_subscriptions")
          .insert({
            company_id: company.id,
            plan_id: planId,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });

        if (subError) throw subError;
      }

      return res.status(200).json({ company });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create company"
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}