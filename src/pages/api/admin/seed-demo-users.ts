import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "./_auth";

type SeedResult = {
  key: string;
  email: string;
  userId: string | null;
  status: "created" | "updated" | "failed";
  error?: string;
};

type AdminListUser = { id: string; email?: string | null };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await requireSuperAdmin(req);
    const supabaseAdmin = getSupabaseAdmin();

    const password = "Demo123!";

    const { data: demoCompany, error: demoCompanyError } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("name", "Demo Workshop NZ")
      .maybeSingle();

    if (demoCompanyError) {
      console.error("Seed demo users: demo company lookup error:", demoCompanyError);
      return res.status(500).json({ error: "Failed to find demo company" });
    }

    const demoCompanyId = demoCompany?.id ?? null;

    const usersToSeed: Array<{
      key: string;
      email: string;
      role: string;
      fullName: string;
      companyId: string | null;
    }> = [
      { key: "super_admin", email: "admin@demo.com", role: "super_admin", fullName: "Demo Super Admin", companyId: null },
      { key: "owner", email: "owner@demo.com", role: "owner", fullName: "Demo Owner", companyId: demoCompanyId },
      { key: "staff", email: "staff@demo.com", role: "staff", fullName: "Demo Staff", companyId: demoCompanyId },
      { key: "inspector", email: "inspector@demo.com", role: "inspector", fullName: "Demo Inspector", companyId: demoCompanyId },
    ];

    const results: SeedResult[] = [];

    for (const u of usersToSeed) {
      try {
        const { data: existing, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });

        if (listError) {
          results.push({ key: u.key, email: u.email, userId: null, status: "failed", error: listError.message });
          continue;
        }

        const list = ((existing as unknown as { users?: AdminListUser[] })?.users ?? []) as AdminListUser[];
        const match = list.find((x) => (x.email ?? "").toLowerCase() === u.email.toLowerCase()) ?? null;

        let userId: string;

        if (match) {
          userId = match.id;

          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: u.fullName,
              role: u.role,
              company_id: u.companyId,
            },
          });

          if (updateError) {
            results.push({ key: u.key, email: u.email, userId, status: "failed", error: updateError.message });
            continue;
          }

          await supabaseAdmin.from("profiles").upsert(
            { id: userId, email: u.email, full_name: u.fullName, role: u.role, company_id: u.companyId } as any,
            { onConflict: "id" }
          );
          await supabaseAdmin.from("users").upsert(
            { id: userId, email: u.email, full_name: u.fullName, role: u.role, company_id: u.companyId } as any,
            { onConflict: "id" }
          );

          results.push({ key: u.key, email: u.email, userId, status: "updated" });
        } else {
          const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: u.fullName,
              role: u.role,
              company_id: u.companyId,
            },
          });

          if (createError || !created.user) {
            results.push({ key: u.key, email: u.email, userId: null, status: "failed", error: createError?.message ?? "createUser failed" });
            continue;
          }

          userId = created.user.id;

          await supabaseAdmin.from("profiles").upsert(
            { id: userId, email: u.email, full_name: u.fullName, role: u.role, company_id: u.companyId } as any,
            { onConflict: "id" }
          );
          await supabaseAdmin.from("users").upsert(
            { id: userId, email: u.email, full_name: u.fullName, role: u.role, company_id: u.companyId } as any,
            { onConflict: "id" }
          );

          results.push({ key: u.key, email: u.email, userId, status: "created" });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        results.push({ key: u.key, email: u.email, userId: null, status: "failed", error: message });
      }
    }

    return res.status(200).json({ password, demoCompanyId, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "NOT_SUPER_ADMIN" ? 403 : message === "MISSING_TOKEN" ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}