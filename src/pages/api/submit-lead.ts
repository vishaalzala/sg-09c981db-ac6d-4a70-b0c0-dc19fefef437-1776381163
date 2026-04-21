import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return res.status(500).json({
                error: "Server is missing Supabase configuration"
            });
        }

        // Use service role on server-side so public contact form is not blocked by RLS
        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const { name, email, phone, company_name, message, source } = req.body ?? {};

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const payload = {
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: phone ? String(phone).trim() : null,
            company_name: company_name ? String(company_name).trim() : null,
            message: message ? String(message).trim() : null,
            source: source ? String(source).trim() : "contact_form",
            status: "new"
        };

        // Try new leads table first
        let insertedData: any = null;
        let insertedError: any = null;

        const leadsInsert = await supabase
            .from("leads")
            .insert(payload)
            .select("id")
            .single();

        insertedData = leadsInsert.data;
        insertedError = leadsInsert.error;

        // Fallback to legacy table if needed
        if (insertedError) {
            console.warn("Insert into leads failed, trying lead_submissions:", insertedError);

            const legacyInsert = await supabase
                .from("lead_submissions")
                .insert(payload)
                .select("id")
                .single();

            insertedData = legacyInsert.data;
            insertedError = legacyInsert.error;
        }

        if (insertedError) {
            console.error("Lead submission failed:", insertedError);
            return res.status(500).json({
                error: insertedError.message || "Failed to submit form"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Thank you! We'll be in touch soon.",
            leadId: insertedData.id
        });
    } catch (error) {
        console.error("Submit lead error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to submit form"
        });
    }
}