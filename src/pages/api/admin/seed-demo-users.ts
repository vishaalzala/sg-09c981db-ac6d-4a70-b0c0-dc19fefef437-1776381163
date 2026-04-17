import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "@/pages/api/admin/_auth";

type DemoUserKey = "admin" | "owner" | "staff" | "inspector";

interface SeedResultItem {
  key: DemoUserKey;
  email: string;
  userId: string | null;
  status: "created" | "updated" | "failed";
  error?: string;
}

async function getOrCreateDemoCompanyId(): Promise<string> {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("name", "Demo Workshop NZ")
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    throw new Error("DEMO_COMPANY_LOOKUP_FAILED");
  }

  if (existing?.id) return existing.id;

  const { data: created, error: createError } = await supabaseAdmin
    .from("companies")
    .insert({
      name: "Demo Workshop NZ",
      country: "NZ",
      timezone: "Pacific/Auckland",
      is_active: true,
      onboarding_completed: true,
    })
    .select("id")
    .single();

  if (createError || !created?.id) {
    console.error("Demo company create error:", createError);
    throw new Error("DEMO_COMPANY_CREATE_FAILED");
  }

  await supabaseAdmin.from("branches").insert({
    company_id: created.id,
    name: "Main Branch",
    is_primary: true,
    is_active: true,
  });

  return created.id;
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    console.error("listUsers error:", error);
    return null;
  }
  const match = (data.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
  return match?.id ?? null;
}

async function createOrGetAuthUser(email: string, password: string, fullName?: string | null) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName ?? undefined },
  });

  if (!error && data.user) {
    return { userId: data.user.id, created: true };
  }

  const existingId = await findAuthUserIdByEmail(email);
  if (existingId) {
    return { userId: existingId, created: false };
  }

  return { userId: null, created: false, error: error?.message ?? "Failed to create user" };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { requesterUserId } = await requireSuperAdmin(req);

    const demoCompanyId = await getOrCreateDemoCompanyId();
    const password = "Demo123!";

    const demoUsers: Array<{ key: DemoUserKey; email: string; role: string; companyId: string | null; fullName: string }> =
      [
        { key: "admin", email: "admin@demo.com", role: "super_admin", companyId: null, fullName: "Demo Super Admin" },
        { key: "owner", email: "owner@demo.com", role: "owner", companyId: demoCompanyId, fullName: "Demo Owner" },
        { key: "staff", email: "staff@demo.com", role: "staff", companyId: demoCompanyId, fullName: "Demo Staff" },
        {
          key: "inspector",
          email: "inspector@demo.com",
          role: "inspector",
          companyId: demoCompanyId,
          fullName: "Demo Inspector",
        },
      ];

    const results: SeedResultItem[] = [];

    for (const u of demoUsers) {
      const created = await createOrGetAuthUser(u.email, password, u.fullName);
      if (!created.userId) {
        results.push({ key: u.key, email: u.email, userId: null, status: "failed", error: created.error ?? "Unknown error" });
        continue;
      }

      const userId = created.userId;

      const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: userId,
          email: u.email.toLowerCase(),
          full_name: u.fullName,
          role: u.role,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        results.push({ key: u.key, email: u.email, userId, status: "failed", error: "Profile upsert failed" });
        continue;
      }

      const { error: userRowError } = await supabaseAdmin.from("users").upsert(
        {
          id: userId,
          email: u.email.toLowerCase(),
          full_name: u.fullName,
          company_id: u.companyId,
          is_active: true,
        },
        { onConflict: "id" }
      );

      if (userRowError) {
        results.push({ key: u.key, email: u.email, userId, status: "failed", error: "Users row upsert failed" });
        continue;
      }

      await supabaseAdmin.from("audit_logs").insert({
        company_id: u.companyId,
        user_id: requesterUserId,
        action_type: "admin.seed_demo_user",
        entity_type: "users",
        entity_id: userId,
        changes: { email: u.email.toLowerCase(), role: u.role, company_id: u.companyId },
      });

      results.push({ key: u.key, email: u.email, userId, status: created.created ? "created" : "updated" });
    }

    return res.status(200).json({
      password,
      demoCompanyId,
      results,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status =
      message === "MISSING_TOKEN" || message === "INVALID_TOKEN" ? 401 : message === "NOT_SUPER_ADMIN" ? 403 : 500;

    return res.status(status).json({ error: message });
  }
}