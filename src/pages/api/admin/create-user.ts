import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "@/pages/api/admin/_auth";

type CreateUserRole = "super_admin" | "owner" | "staff" | "inspector" | "service_advisor" | "technician";

interface CreateUserBody {
  email: string;
  password: string;
  fullName?: string;
  role: CreateUserRole;
  companyId?: string | null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { requesterUserId } = await requireSuperAdmin(req);

    const body = (req.body ?? {}) as Partial<CreateUserBody>;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const role = body.role;
    const fullName = (body.fullName ?? "").trim() || null;
    const companyId = body.companyId ?? null;

    if (!isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    if (role === "super_admin" && companyId) {
      return res.status(400).json({ error: "super_admin cannot be assigned to a company" });
    }

    if (role !== "super_admin" && !companyId) {
      return res.status(400).json({ error: "Company is required for non-admin users" });
    }

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName ?? undefined,
      },
    });

    if (createError || !createData.user) {
      console.error("Create auth user error:", createError);
      return res.status(400).json({ error: createError?.message ?? "Failed to create user" });
    }

    const newUserId = createData.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: newUserId,
        email,
        full_name: fullName,
        role,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Upsert profile error:", profileError);
      return res.status(500).json({ error: "Failed to create profile" });
    }

    const { error: userRowError } = await supabaseAdmin.from("users").upsert(
      {
        id: newUserId,
        email,
        full_name: fullName,
        company_id: role === "super_admin" ? null : companyId,
        is_active: true,
      },
      { onConflict: "id" }
    );

    if (userRowError) {
      console.error("Upsert users row error:", userRowError);
      return res.status(500).json({ error: "Failed to create app user record" });
    }

    await supabaseAdmin.from("audit_logs").insert({
      company_id: role === "super_admin" ? null : companyId,
      user_id: requesterUserId,
      action_type: "admin.create_user",
      entity_type: "users",
      entity_id: newUserId,
      changes: { email, role, company_id: companyId },
    });

    return res.status(200).json({
      user: {
        id: newUserId,
        email,
        role,
        companyId: role === "super_admin" ? null : companyId,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status =
      message === "MISSING_TOKEN" || message === "INVALID_TOKEN" ? 401 : message === "NOT_SUPER_ADMIN" ? 403 : 500;

    return res.status(status).json({ error: message });
  }
}