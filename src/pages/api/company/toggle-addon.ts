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
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
    }

    return createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}

async function safeInsertBillingEvent(admin: any, input: any) {
    // This app has had two billing_events schemas across migrations.
    // Try the older app schema first, then the Stripe/webhook schema. Never block add-on activation on logging.
    const oldPayload = {
        company_id: input.company_id,
        event_type: input.event_type,
        amount: input.amount ?? 0,
        currency: input.currency ?? "NZD",
        description: input.description,
        status: input.status ?? "success",
        metadata: input.metadata ?? {},
    };

    const first = await admin.from("billing_events").insert(oldPayload);
    if (!first.error) return;

    const newPayload = {
        company_id: input.company_id,
        event_type: input.event_type,
        processing_status: "processed",
        payload: {
            amount: input.amount ?? 0,
            currency: input.currency ?? "NZD",
            description: input.description,
            metadata: input.metadata ?? {},
        },
        processed_at: new Date().toISOString(),
    };

    const second = await admin.from("billing_events").insert(newPayload);
    if (second.error) {
        console.error("billing_events insert skipped", first.error.message, second.error.message);
    }
}

async function safeInsertAuditLog(admin: any, payload: any) {
    const { error } = await admin.from("audit_logs").insert(payload);
    if (error) console.error("audit_logs insert skipped", error.message);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const admin = getAdminClient();
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

        if (!token) return res.status(401).json({ error: "Missing auth token" });

        const { data: authData, error: authError } = await admin.auth.getUser(token);
        const user = authData?.user;
        if (authError || !user) return res.status(401).json({ error: "Invalid user session" });

        const { companyId, addonId, enabled } = (req.body || {}) as TogglePayload;
        if (!companyId || !addonId || typeof enabled !== "boolean") {
            return res.status(400).json({ error: "companyId, addonId and enabled are required" });
        }

        // Never select users.role. Your users table uses role_id. profiles.role is the auth source of truth.
        const [{ data: profile }, { data: companyUser, error: companyUserError }] = await Promise.all([
            admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
            admin.from("users").select("id, company_id, role_id").eq("id", user.id).maybeSingle(),
        ]);

        if (companyUserError) throw companyUserError;

        const profileRole = profile?.role;
        const roleId = (companyUser as any)?.role_id;
        const isSuperAdmin = profileRole === "super_admin";
        const belongsToCompany = (companyUser as any)?.company_id === companyId;
        const allowedRoles = ["company_owner", "owner", "admin", "branch_manager", "manager"];

        if (!isSuperAdmin && (!belongsToCompany || !allowedRoles.includes(profileRole || roleId))) {
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

        const timestamp = new Date().toISOString();
        let companyAddon: any;

        const patch = {
            is_enabled: enabled,
            enabled_at: enabled ? timestamp : null,
            disabled_at: enabled ? null : timestamp,
        };

        if (existing?.id) {
            const { data, error } = await admin
                .from("company_addons")
                .update(patch)
                .eq("id", existing.id)
                .select()
                .single();
            if (error) throw error;
            companyAddon = data;
        } else {
            const { data, error } = await admin
                .from("company_addons")
                .insert({ company_id: companyId, addon_id: addonId, ...patch })
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
            metadata: { addon_id: addonId, company_addon_id: companyAddon.id, changed_by: user.id, source: "company_settings" },
        });

        await safeInsertAuditLog(admin, {
            user_id: user.id,
            company_id: companyId,
            action_type: enabled ? "addon_enabled" : "addon_disabled",
            entity_type: "company_addon",
            entity_id: companyAddon.id,
            changes: { addon_id: addonId, addon_name: addon.display_name || addon.name, enabled, source: "company_settings" },
        });

        return res.status(200).json({ success: true, addon: companyAddon });
    } catch (error: any) {
        console.error("company/toggle-addon error", error);
        return res.status(500).json({ error: error.message || "Failed to update add-on" });
    }
}
