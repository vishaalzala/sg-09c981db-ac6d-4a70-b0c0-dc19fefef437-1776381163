import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";

type Body = {
    companyName?: string;
    phone?: string;
};

function extractBearerToken(req: NextApiRequest): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isServiceRoleConfigured()) {
        return res.status(500).json({
            error: "Server configuration error. Missing Supabase service role configuration.",
        });
    }

    const token = extractBearerToken(req);
    if (!token) {
        return res.status(401).json({ error: "Missing authorization token." });
    }

    const body = (req.body ?? {}) as Body;
    const companyName = body.companyName?.trim();
    const phone = body.phone?.trim() || null;

    if (!companyName) {
        return res.status(400).json({ error: "Company name is required." });
    }

    try {
        const admin = getSupabaseAdmin();
        const {
            data: { user },
            error: authError,
        } = await admin.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: authError?.message || "Invalid or expired session." });
        }

        const userId = user.id;
        const userEmail = user.email || "";
        const fullName =
            (user.user_metadata?.full_name as string | undefined)?.trim() || userEmail;

        // If already linked, return existing company
        const { data: existingUserLink, error: existingUserLinkError } = await admin
            .from("users")
            .select("company_id")
            .eq("id", userId)
            .maybeSingle();

        if (existingUserLinkError) throw existingUserLinkError;

        if (existingUserLink?.company_id) {
            const { data: existingCompany, error: existingCompanyError } = await admin
                .from("companies")
                .select("id, name")
                .eq("id", existingUserLink.company_id)
                .maybeSingle();

            if (existingCompanyError) throw existingCompanyError;

            if (existingCompany?.id) {
                return res.status(200).json({
                    company: existingCompany,
                    alreadyLinked: true,
                });
            }
        }

        // Create company using only broadly-safe columns
        const { data: company, error: companyError } = await admin
            .from("companies")
            .insert({
                name: companyName,
                email: userEmail || null,
                phone,
                is_active: true,
            })
            .select("id, name")
            .single();

        if (companyError || !company) {
            throw companyError || new Error("Unable to create company.");
        }

        // Ensure profile exists
        const { error: profileError } = await admin.from("profiles").upsert(
            {
                id: userId,
                email: userEmail,
                full_name: fullName,
                role: "company_owner",
            },
            { onConflict: "id" }
        );

        if (profileError) throw profileError;

        // Link user to company using only core columns
        const { error: userLinkError } = await admin.from("users").upsert(
            {
                id: userId,
                company_id: company.id,
                email: userEmail,
                full_name: fullName,
            },
            { onConflict: "id" }
        );

        if (userLinkError) throw userLinkError;

        // Best-effort Free Trial assignment
        let trialInfo: { planName: string; trialDays: number } | null = null;

        try {
            const { data: settingsRows } = await admin
                .from("platform_settings")
                .select("setting_key, setting_value")
                .in("setting_key", ["trial_settings", "signup_settings"]);

            const settingsMap = new Map(
                (settingsRows || []).map((row: any) => [row.setting_key, row.setting_value])
            );

            const trialSettings = settingsMap.get("trial_settings") || {};
            const signupSettings = settingsMap.get("signup_settings") || {};

            const trialDays = Number(trialSettings.trial_duration_days ?? 14);
            const defaultPlanName = String(signupSettings.default_plan ?? "free_trial");

            const { data: trialPlan } = await admin
                .from("subscription_plans")
                .select("id, name")
                .eq("name", defaultPlanName)
                .maybeSingle();

            if (trialPlan?.id) {
                const now = new Date();
                const trialEnd = new Date(now);
                trialEnd.setDate(trialEnd.getDate() + trialDays);

                await admin.from("company_subscriptions").upsert(
                    {
                        company_id: company.id,
                        plan_id: trialPlan.id,
                        status: "trialing",
                        billing_cycle: "monthly",
                        current_period_start: now.toISOString(),
                        current_period_end: trialEnd.toISOString(),
                        trial_ends_at: trialEnd.toISOString(),
                    },
                    { onConflict: "company_id" }
                );

                trialInfo = {
                    planName: trialPlan.name,
                    trialDays,
                };
            }
        } catch (trialError) {
            console.warn("Free trial assignment skipped:", trialError);
        }

        return res.status(200).json({
            company,
            trial: trialInfo,
        });
    } catch (error) {
        console.error("Company onboarding API error:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Unable to complete company setup.",
        });
    }
}