import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const authHeader = req.headers.authorization;
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "Missing auth token" });
        }

        const {
            data: { user },
            error: userError,
        } = await supabaseAdmin.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ error: "Invalid user session" });
        }

        const { companyId, addonId, enabled } = req.body;

        if (!companyId || !addonId || typeof enabled !== "boolean") {
            return res.status(400).json({
                error: "companyId, addonId and enabled are required",
            });
        }

        const { data: companyUser, error: companyUserError } = await supabaseAdmin
            .from("users")
            .select("id, company_id, role_id, role")
            .eq("id", user.id)
            .eq("company_id", companyId)
            .maybeSingle();

        if (companyUserError) throw companyUserError;

        if (!companyUser) {
            return res.status(403).json({ error: "You do not belong to this company" });
        }

        const role = companyUser.role_id || companyUser.role;

        if (!["owner", "admin", "company_owner"].includes(role)) {
            return res.status(403).json({
                error: "Only company owner/admin can manage add-ons",
            });
        }

        const { data: existing, error: existingError } = await supabaseAdmin
            .from("company_addons")
            .select("id")
            .eq("company_id", companyId)
            .eq("addon_id", addonId)
            .maybeSingle();

        if (existingError) throw existingError;

        let companyAddon;

        if (existing?.id) {
            const { data, error } = await supabaseAdmin
                .from("company_addons")
                .update({
                    is_enabled: enabled,
                    enabled_at: enabled ? new Date().toISOString() : null,
                    disabled_at: enabled ? null : new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id)
                .select()
                .single();

            if (error) throw error;
            companyAddon = data;
        } else {
            const { data, error } = await supabaseAdmin
                .from("company_addons")
                .insert({
                    company_id: companyId,
                    addon_id: addonId,
                    is_enabled: enabled,
                    enabled_at: enabled ? new Date().toISOString() : null,
                    disabled_at: enabled ? null : new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            companyAddon = data;
        }

        await supabaseAdmin.from("billing_events").insert({
            company_id: companyId,
            event_type: enabled ? "addon_enabled" : "addon_disabled",
            amount: 0,
            currency: "NZD",
            description: enabled ? "Add-on enabled by company" : "Add-on disabled by company",
            status: "success",
            metadata: {
                addon_id: addonId,
                company_addon_id: companyAddon.id,
                changed_by: user.id,
            },
        });

        await supabaseAdmin.from("audit_logs").insert({
            user_id: user.id,
            company_id: companyId,
            action_type: enabled ? "addon_enabled" : "addon_disabled",
            entity_type: "company_addon",
            entity_id: companyAddon.id,
            metadata: {
                addon_id: addonId,
                enabled,
            },
        });

        return res.status(200).json({
            success: true,
            addon: companyAddon,
        });
    } catch (error: any) {
        console.error("toggle-addon error:", error);
        return res.status(500).json({
            error: error.message || "Failed to update add-on",
        });
    }
}