import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "./_auth";

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) throw new Error("Missing Supabase service role environment variables");
    return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function safeInsertBillingEvent(supabase: any, payload: any) {
    const { error } = await supabase.from("billing_events").insert(payload);
    if (error) console.error("billing_events insert failed", error);
}

async function safeInsertAuditLog(supabase: any, payload: any) {
    const { error } = await supabase.from("audit_logs").insert(payload);
    if (error) console.error("audit_logs insert failed", error);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { authorized, user } = await verifyAdmin(req);
    if (!authorized) return res.status(403).json({ error: "Unauthorized" });
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const supabase = getAdminClient();
        const { companyId, addonId, enabled } = req.body || {};

        if (!companyId || !addonId || typeof enabled !== "boolean") {
            return res.status(400).json({ error: "companyId, addonId and enabled are required" });
        }

        const { data: addon, error: addonError } = await supabase
            .from("addon_catalog")
            .select("id, name, display_name, price_monthly")
            .eq("id", addonId)
            .maybeSingle();

        if (addonError) throw addonError;
        if (!addon) return res.status(404).json({ error: "Add-on not found" });

        const { data: existing, error: existingError } = await supabase
            .from("company_addons")
            .select("id")
            .eq("company_id", companyId)
            .eq("addon_id", addonId)
            .maybeSingle();

        if (existingError) throw existingError;

        let result: any = null;
        const timestamp = new Date().toISOString();

        if (existing?.id) {
            const { data, error } = await supabase
                .from("company_addons")
                .update({
                    is_enabled: enabled,
                    enabled_at: enabled ? timestamp : null,
                    disabled_at: enabled ? null : timestamp,
                })
                .eq("id", existing.id)
                .select()
                .single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase
                .from("company_addons")
                .insert({
                    company_id: companyId,
                    addon_id: addonId,
                    is_enabled: enabled,
                    enabled_at: enabled ? timestamp : null,
                    disabled_at: enabled ? null : timestamp,
                })
                .select()
                .single();
            if (error) throw error;
            result = data;
        }

        await safeInsertBillingEvent(supabase, {
            company_id: companyId,
            event_type: enabled ? "addon_enabled_by_admin" : "addon_disabled_by_admin",
            amount: 0,
            currency: "NZD",
            description: `${addon.display_name || addon.name} ${enabled ? "enabled" : "disabled"} by super admin`,
            status: "success",
            metadata: {
                addon_id: addonId,
                company_addon_id: result.id,
                changed_by: user?.id,
                source: "admin_company_detail",
            },
        });

        await safeInsertAuditLog(supabase, {
            user_id: user?.id,
            company_id: companyId,
            action_type: enabled ? "addon_enabled" : "addon_disabled",
            entity_type: "company_addon",
            entity_id: result.id,
            changes: {
                addon_id: addonId,
                addon_name: addon.display_name || addon.name,
                enabled,
                source: "admin_company_detail",
            },
        });

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("admin/company-addons error", error);
        return res.status(500).json({ error: error.message || "Failed to update company add-on" });
    }
}
