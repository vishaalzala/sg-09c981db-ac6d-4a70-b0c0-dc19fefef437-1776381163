import type { NextApiRequest } from "next";
import { supabaseAdmin, assertServiceRoleConfigured } from "@/lib/supabaseAdmin";

export interface AdminAuthContext {
  requesterUserId: string;
}

export async function requireSuperAdmin(req: NextApiRequest): Promise<AdminAuthContext> {
  assertServiceRoleConfigured();

  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token) {
    throw new Error("MISSING_TOKEN");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("INVALID_TOKEN");
  }

  const requesterUserId = data.user.id;

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", requesterUserId)
    .maybeSingle();

  if (profileError) {
    console.error("Admin auth profile lookup error:", profileError);
    throw new Error("PROFILE_LOOKUP_FAILED");
  }

  if (!profile || profile.role !== "super_admin") {
    throw new Error("NOT_SUPER_ADMIN");
  }

  return { requesterUserId };
}