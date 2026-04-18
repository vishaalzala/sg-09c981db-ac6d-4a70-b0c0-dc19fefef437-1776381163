import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { name, email, phone, company_name, message, source } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    console.log("Submitting lead:", { name, email, company_name, source: source || "contact_form" });

    // Insert lead submission
    const { data, error } = await supabase
      .from("lead_submissions")
      .insert({
        name,
        email,
        phone: phone || null,
        company_name: company_name || null,
        message: message || null,
        source: source || "contact_form",
        status: "new"
      })
      .select()
      .single();

    if (error) {
      console.error("Lead submission error:", error);
      throw error;
    }

    console.log("Lead submitted successfully:", data.id);

    return res.status(200).json({
      success: true,
      message: "Thank you! We'll be in touch soon.",
      leadId: data.id
    });

  } catch (error) {
    console.error("Submit lead error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to submit form",
      details: error
    });
  }
}