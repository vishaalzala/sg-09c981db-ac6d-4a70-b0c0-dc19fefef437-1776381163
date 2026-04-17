import { supabase } from "@/integrations/supabase/client";

export type AdminCreateUserRole =
  | "super_admin"
  | "owner"
  | "staff"
  | "inspector"
  | "service_advisor"
  | "technician";

export interface AdminCompanyOption {
  id: string;
  name: string;
  is_active: boolean | null;
}

export interface AdminCreateUserInput {
  email: string;
  password: string;
  role: AdminCreateUserRole;
  fullName?: string;
  companyId?: string | null;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return token;
}

export const adminService = {
  async listCompanies(): Promise<AdminCompanyOption[]> {
    const token = await getAccessToken();
    const res = await fetch("/api/admin/companies", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = (await res.json()) as { companies?: AdminCompanyOption[]; error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load companies");
    }

    return json.companies ?? [];
  },

  async createUser(input: AdminCreateUserInput) {
    const token = await getAccessToken();
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    const json = (await res.json()) as { user?: { id: string; email: string; role: string; companyId: string | null }; error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to create user");
    }

    return json.user!;
  },

  async seedDemoUsers() {
    const token = await getAccessToken();
    const res = await fetch("/api/admin/seed-demo-users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = (await res.json()) as {
      password?: string;
      demoCompanyId?: string;
      results?: Array<{ key: string; email: string; userId: string | null; status: string; error?: string }>;
      error?: string;
    };

    if (!res.ok) {
      throw new Error(json.error ?? "Failed to seed demo users");
    }

    return json;
  },
};