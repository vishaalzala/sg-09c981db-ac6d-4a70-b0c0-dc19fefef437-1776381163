import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdmin } from "./_auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await requireSuperAdmin(req);
    const supabaseAdmin = getSupabaseAdmin();

    const { email, password, role, companyId, fullName } = req.body as {
      email?: string;
      password?: string;
      role?: string;
      companyId?: string | null;
      fullName?: string;
    };

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName ?? null,
        role,
        company_id: companyId ?? null,
      },
    });

    if (createError || !created.user) {
      console.error("Admin createUser error:", createError);
      return res.status(400).json({ error: createError?.message ?? "Failed to create user" });
    }

    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName ?? null,
        role,
        company_id: companyId ?? null,
      } as any,
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Admin profile upsert error:", profileError);
      return res.status(500).json({ error: "User created but profile link failed" });
    }

    const { error: userRowError } = await supabaseAdmin.from("users").upsert(
      {
        id: userId,
        email,
        full_name: fullName ?? null,
        role,
        company_id: companyId ?? null,
      } as any,
      { onConflict: "id" }
    );

    if (userRowError) {
      console.error("Admin users upsert error:", userRowError);
      return res.status(500).json({ error: "User created but users table link failed" });
    }

    return res.status(200).json({
      user: {
        id: userId,
        email,
        role,
        companyId: companyId ?? null,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";

    const status =
      message === "MISSING_TOKEN"
        ? 401
        : message === "INVALID_TOKEN"
          ? 401
          : message === "NOT_SUPER_ADMIN"
            ? 403
            : message.includes("SUPABASE_SERVICE_ROLE_KEY")
              ? 500
              : 500;

    return res.status(status).json({ error: message });
  }
}