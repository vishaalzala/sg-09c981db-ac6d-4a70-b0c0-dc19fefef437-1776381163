import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalUsers: number;
  trialCompanies: number;
  paidCompanies: number;
  alerts: any[];
  recentSignups: any[];
  recentChanges: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [companiesResult, usersResult, subscriptionsResult, auditResult] = await Promise.all([
    supabase.from("companies").select("id, is_active, created_at"),
    supabase.from("users").select("id"),
    supabase.from("company_subscriptions").select("company_id, status"),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(5)
  ]);

  const companies = companiesResult.data || [];
  const users = usersResult.data || [];
  const subscriptions = subscriptionsResult.data || [];

  const activeCompanies = companies.filter(c => c.is_active).length;
  const trialCompanies = subscriptions.filter(s => s.status === "trial_active").length;
  const paidCompanies = subscriptions.filter(s => s.status === "active").length;

  const recentSignups = companies
    .filter(c => {
      const createdDate = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    })
    .slice(0, 5);

  return {
    totalCompanies: companies.length,
    activeCompanies,
    inactiveCompanies: companies.length - activeCompanies,
    totalUsers: users.length,
    trialCompanies,
    paidCompanies,
    alerts: [],
    recentSignups,
    recentChanges: auditResult.data || []
  };
}

// ============================================
// COMPANY MANAGEMENT
// ============================================

export async function getAllCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      subscription:company_subscriptions(
        *,
        plan:subscription_plans(*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllCompanies error:", error);
    throw error;
  }

  const formatted = data?.map(company => ({
    ...company,
    subscription: Array.isArray(company.subscription) && company.subscription.length > 0
      ? company.subscription[0]
      : Array.isArray(company.subscription)
      ? null
      : company.subscription
  }));

  return formatted || [];
}

export async function getCompanyById(companyId: string): Promise<CompanyWithDetails> {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      subscription:company_subscriptions(
        *,
        plan:subscription_plans(*)
      ),
      users(*,
        role:roles(*)
      ),
      addons:company_addons(
        *,
        addon:addon_catalog(*)
      ),
      branches(*)
    `)
    .eq("id", companyId)
    .single();

  if (error) throw error;
  
  const formatted = {
    ...data,
    subscription: Array.isArray(data.subscription) ? data.subscription[0] : data.subscription
  };
  
  return formatted as unknown as CompanyWithDetails;
}

export async function createCompany(companyData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}) {
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone,
      address: companyData.address,
      is_active: companyData.is_active ?? true
    })
    .select()
    .single();

  if (companyError) throw companyError;
  return company;
}

export async function updateCompany(companyId: string, updates: Partial<Tables<"companies">>) {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function disableCompany(companyId: string) {
  return updateCompany(companyId, { is_active: false });
}

export async function enableCompany(companyId: string) {
  return updateCompany(companyId, { is_active: true });
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function getAllUsers() {
  // Fetch users with profiles to get role (NO users.role_id dependency)
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      company:companies(name),
      profile:profiles!users_id_fkey(role)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllUsers error:", error);
    throw error;
  }

  // Map profile.role to display format
  const usersWithRoles = data?.map(user => {
    const role = Array.isArray(user.profile) && user.profile.length > 0
      ? user.profile[0]?.role
      : user.profile?.role;

    return {
      ...user,
      role: {
        name: role || "unknown",
        display_name: formatRoleName(role || "unknown")
      }
    };
  });

  return usersWithRoles || [];
}

export async function getUsersByCompany(companyId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      profile:profiles!users_id_fkey(role)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUsersByCompany error:", error);
    throw error;
  }

  const usersWithRoles = data?.map(user => {
    const role = Array.isArray(user.profile) && user.profile.length > 0
      ? user.profile[0]?.role
      : user.profile?.role;

    return {
      ...user,
      role: {
        name: role || "unknown",
        display_name: formatRoleName(role || "unknown")
      }
    };
  });

  return usersWithRoles || [];
}

// Helper to format role names for display
function formatRoleName(role: string): string {
  return role
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================
// PLAN MANAGEMENT
// ============================================

export async function getAllPlans() {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

type PlanInsert = Database["public"]["Tables"]["subscription_plans"]["Insert"];

export async function createPlan(planData: PlanInsert) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .insert(planData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePlan(planId: string, updates: Partial<Tables<"subscription_plans">>) {
  const { data, error } = await supabase
    .from("subscription_plans")
    .update(updates)
    .eq("id", planId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

export async function assignPlanToCompany(
  companyId: string,
  planId: string,
  options?: {
    status?: string;
    billing_cycle?: string;
    trial_ends_at?: string;
  }
) {
  // Check if subscription exists
  const { data: existing } = await supabase
    .from("company_subscriptions")
    .select("id")
    .eq("company_id", companyId)
    .single();

  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscriptionData = {
    company_id: companyId,
    plan_id: planId,
    status: options?.status || "active",
    billing_cycle: options?.billing_cycle || "monthly",
    trial_ends_at: options?.trial_ends_at || null,
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd.toISOString()
  };

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("company_subscriptions")
      .update(subscriptionData)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from("company_subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function startTrial(companyId: string, planId: string, days: number = 14) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + days);

  return assignPlanToCompany(companyId, planId, {
    status: "trial_active",
    trial_ends_at: trialEnd.toISOString()
  });
}

export async function convertTrialToPaid(companyId: string, planId: string) {
  return assignPlanToCompany(companyId, planId, {
    status: "active",
    trial_ends_at: null
  });
}

// ============================================
// ADD-ON MANAGEMENT
// ============================================

export async function getAllAddons() {
  const { data, error } = await supabase
    .from("addon_catalog")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

type AddonInsert = Database["public"]["Tables"]["addon_catalog"]["Insert"];

export async function createAddon(addonData: AddonInsert) {
  const { data, error } = await supabase
    .from("addon_catalog")
    .insert(addonData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAddon(addonId: string, updates: Partial<Tables<"addon_catalog">>) {
  const { data, error } = await supabase
    .from("addon_catalog")
    .update(updates)
    .eq("id", addonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignAddonToCompany(companyId: string, addonId: string) {
  const { data, error } = await supabase
    .from("company_addons")
    .insert({
      company_id: companyId,
      addon_id: addonId,
      is_enabled: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeAddonFromCompany(companyId: string, addonId: string) {
  const { error } = await supabase
    .from("company_addons")
    .delete()
    .eq("company_id", companyId)
    .eq("addon_id", addonId);

  if (error) throw error;
}

export async function toggleAddon(companyId: string, addonId: string, enabled: boolean) {
  const { data, error } = await supabase
    .from("company_addons")
    .update({
      is_enabled: enabled,
      enabled_at: enabled ? new Date().toISOString() : null,
      disabled_at: enabled ? null : new Date().toISOString()
    })
    .eq("company_id", companyId)
    .eq("addon_id", addonId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// ROLE MANAGEMENT
// ============================================

export async function getAllRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createRole(roleData: { name: string; display_name?: string; description?: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify(roleData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create role");
  }

  return response.json();
}

export async function updateRole(roleId: string, updates: { name?: string; display_name?: string; description?: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/roles", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ id: roleId, ...updates })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update role");
  }

  return response.json();
}

export async function deleteRole(roleId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/roles", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ id: roleId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete role");
  }

  return response.json();
}

// ============================================
// PERMISSION MANAGEMENT
// ============================================

export async function getAllPermissions() {
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("category, name");

  if (error) throw error;
  return data;
}

export async function createPermission(permissionData: { name: string; category?: string; description?: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/permissions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify(permissionData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create permission");
  }

  return response.json();
}

export async function updatePermission(permissionId: string, updates: { name?: string; category?: string; description?: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/permissions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ id: permissionId, ...updates })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update permission");
  }

  return response.json();
}

export async function deletePermission(permissionId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch("/api/admin/permissions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ id: permissionId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete permission");
  }

  return response.json();
}

export async function getRolePermissions(roleId: string) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("*, permission:permissions(*)")
    .eq("role_id", roleId);

  if (error) throw error;
  return data;
}

export async function assignPermissionToRole(roleId: string, permissionId: string) {
  const { data, error } = await supabase
    .from("role_permissions")
    .insert({
      role_id: roleId,
      permission_id: permissionId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .eq("permission_id", permissionId);

  if (error) throw error;
}

// ============================================
// AUDIT LOGS
// ============================================

export async function getAuditLogs(filters?: {
  companyId?: string;
  userId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  let query = supabase
    .from("audit_logs")
    .select(`
      *,
      user:users(full_name, email),
      company:companies(name)
    `)
    .order("created_at", { ascending: false });

  if (filters?.companyId) {
    query = query.eq("company_id", filters.companyId);
  }
  
  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }
  
  if (filters?.actionType) {
    query = query.eq("action_type", filters.actionType);
  }
  
  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  
  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  query = query.limit(filters?.limit || 100);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================
// SUPPORT TOOLS
// ============================================

export interface AccountDiagnostics {
  authUser: any;
  profile: any;
  userRecord: any;
  company: any;
  subscription: any;
  addons: any[];
  issues: string[];
  recommendations: string[];
}

export async function diagnoseAccount(userId: string): Promise<AccountDiagnostics> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  if (!authUser?.user) {
    issues.push("Auth user not found");
  }

  // Check profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (!profile) {
    issues.push("Profile record missing");
    recommendations.push("Create profile record for this user");
  }

  // Check users table
  const { data: userRecord } = await supabase
    .from("users")
    .select("*, role:roles(*), company:companies(*)")
    .eq("id", userId)
    .single();
  
  if (!userRecord) {
    issues.push("Users table record missing");
    recommendations.push("Create users record with company_id");
  } else if (!userRecord.company_id) {
    issues.push("No company_id linked");
    recommendations.push("Assign user to a company");
  }

  // Check company
  let company = null;
  if (userRecord?.company_id) {
    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("id", userRecord.company_id)
      .single();
    
    company = companyData;
    if (!companyData) {
      issues.push("Company not found");
    } else if (!companyData.is_active) {
      issues.push("Company is inactive");
      recommendations.push("Activate the company");
    }
  }

  // Check subscription
  let subscription = null;
  if (userRecord?.company_id) {
    const { data: subData } = await supabase
      .from("company_subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("company_id", userRecord.company_id)
      .single();
    
    subscription = subData;
    if (!subData) {
      issues.push("No subscription found");
      recommendations.push("Assign a subscription plan");
    }
  }

  // Check addons
  let addons: any[] = [];
  if (userRecord?.company_id) {
    const { data: addonsData } = await supabase
      .from("company_addons")
      .select("*, addon:addon_catalog(*)")
      .eq("company_id", userRecord.company_id);
    
    addons = addonsData || [];
  }

  return {
    authUser: authUser?.user,
    profile,
    userRecord,
    company,
    subscription,
    addons,
    issues,
    recommendations
  };
}

export async function searchCompanies(query: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*, subscription:company_subscriptions(*, plan:subscription_plans(*))")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
}

export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*, company:companies(name), role:roles(display_name)")
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
}

// ============================================
// USAGE RECORDS
// ============================================

export async function getUsageRecords(companyId: string, options?: {
  startDate?: string;
  endDate?: string;
  addonId?: string;
}) {
  let query = supabase
    .from("usage_records")
    .select("*, addon:addon_catalog(name)")
    .eq("company_id", companyId)
    .order("recorded_at", { ascending: false });

  if (options?.startDate) {
    query = query.gte("billing_period_start", options.startDate);
  }
  
  if (options?.endDate) {
    query = query.lte("billing_period_end", options.endDate);
  }
  
  if (options?.addonId) {
    query = query.eq("addon_id", options.addonId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ============================================
// REPORTS
// ============================================

export async function getCompanyGrowthReport(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("companies")
    .select("created_at, name")
    .gte("created_at", startDate.toISOString())
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function getTrialConversionReport() {
  const { data, error } = await supabase
    .from("company_subscriptions")
    .select(`
      *,
      company:companies(name, created_at)
    `)
    .in("status", ["trial_active", "trial_expired", "active"]);

  if (error) throw error;
  return data;
}

export async function getRevenueReport(options?: {
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from("company_subscriptions")
    .select(`
      *,
      plan:subscription_plans(price_monthly, price_annual),
      company:companies(name)
    `)
    .eq("status", "active");

  if (options?.startDate) {
    query = query.gte("current_period_start", options.startDate);
  }
  
  if (options?.endDate) {
    query = query.lte("current_period_end", options.endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Calculate total revenue
  const revenue = data?.reduce((sum, sub) => {
    const price = sub.billing_cycle === "annual" 
      ? sub.plan?.price_annual || 0 
      : sub.plan?.price_monthly || 0;
    return sum + price;
  }, 0) || 0;

  return {
    subscriptions: data,
    totalRevenue: revenue,
    count: data?.length || 0
  };
}