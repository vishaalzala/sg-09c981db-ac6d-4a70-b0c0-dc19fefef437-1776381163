import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type TogglePayload = {
    companyId?: string;
    addonId?: string;
    enabled?: boolean;
};

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Missing Supabase service role environment variables");
    }

    return createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

async function safeInsertBillingEvent(admin: any, payload: any) {
    const { error } = await admin.from("billing_events").insert(payload);
    if (error) {
        console.error("billing_events insert failed", error);
    }
}

async function safeInsertAuditLog(admin: any, payload: any) {
    const { error } = await admin.from("audit_logs").insert(payload);
    if (error) {
        console.error("audit_logs insert failed", error);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const admin = getAdminClient();
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

        if (!token) {
            return res.status(401).json({ error: "Missing auth token" });
        }

        const {
            data: { user },
            error: authError,
        } = await admin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid user session" });
        }

        const { companyId, addonId, enabled } = (req.body || {}) as TogglePayload;

        if (!companyId || !addonId || typeof enabled !== "boolean") {
            return res.status(400).json({ error: "companyId, addonId and enabled are required" });
        }

        const { data: profile } = await admin
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        const { data: companyUser, error: companyUserError } = await admin
            .from("users")
            .select("id, company_id, role_id, roles(name)")
            .eq("id", user.id)
            .maybeSingle();

        if (companyUserError) throw companyUserError;

        const profileRole = profile?.role;
        const roleName = (companyUser as any)?.roles?.name || (companyUser as any)?.role_id;
        const isSuperAdmin = profileRole === "super_admin";
        const belongsToCompany = (companyUser as any)?.company_id === companyId;
        const allowedCompanyRoles = ["company_owner", "owner", "admin", "branch_manager"];

        if (!isSuperAdmin && (!belongsToCompany || !allowedCompanyRoles.includes(roleName))) {
            return res.status(403).json({ error: "Only a company owner/admin can manage add-ons" });
        }

        const { data: addon, error: addonError } = await admin
            .from("addon_catalog")
            .select("id, name, display_name, price_monthly")
            .eq("id", addonId)
            .maybeSingle();

        if (addonError) throw addonError;
        if (!addon) return res.status(404).json({ error: "Add-on not found" });

        const { data: existing, error: existingError } = await admin
            .from("company_addons")
            .select("id")
            .eq("company_id", companyId)
            .eq("addon_id", addonId)
            .maybeSingle();

        if (existingError) throw existingError;

        let companyAddon: any;
        const timestamp = new Date().toISOString();

        if (existing?.id) {
            const { data, error } = await admin
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
            companyAddon = data;
        } else {
            const { data, error } = await admin
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
            companyAddon = data;
        }

        await safeInsertBillingEvent(admin, {
            company_id: companyId,
            event_type: enabled ? "addon_enabled" : "addon_disabled",
            amount: 0,
            currency: "NZD",
            description: `${addon.display_name || addon.name} ${enabled ? "enabled" : "disabled"} by company`,
            status: "success",
            metadata: {
                addon_id: addonId,
                company_addon_id: companyAddon.id,
                changed_by: user.id,
                source: "company_settings",
            },
        });

        await safeInsertAuditLog(admin, {
            user_id: user.id,
            company_id: companyId,
            action_type: enabled ? "addon_enabled" : "addon_disabled",
            entity_type: "company_addon",
            entity_id: companyAddon.id,
            changes: {
                addon_id: addonId,
                addon_name: addon.display_name || addon.name,
                enabled,
                source: "company_settings",
            },
        });

        return res.status(200).json({ success: true, addon: companyAddon });
    } catch (error: any) {
        console.error("company/toggle-addon error", error);
        return res.status(500).json({ error: error.message || "Failed to update add-on" });
    }
}
