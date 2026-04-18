import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface DashboardStats {
  totalCompanies: number;
  totalUsers: number;
  activeTrials: number;
  paidSubscriptions: number;
  monthlyRevenue: number;
  trialConversionRate: number;
}

export interface CompanyWithDetails extends Tables<"companies"> {
  subscription?: Tables<"company_subscriptions"> & {
    plan?: Tables<"subscription_plans">;
  };
  users_count?: number;
  addons_count?: number;
}

// Dashboard Statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  // Total companies
  const { count: totalCompanies } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Total users
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Active trials
  const { count: activeTrials } = await supabase
    .from("company_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "trial_active");

  // Paid subscriptions
  const { count: paidSubscriptions } = await supabase
    .from("company_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Revenue calculation
  const { data: subscriptions } = await supabase
    .from("company_subscriptions")
    .select("*, plan:subscription_plans(price_monthly)")
    .eq("status", "active");

  const monthlyRevenue = subscriptions?.reduce((sum, sub) => {
    return sum + (sub.plan?.price_monthly || 0);
  }, 0) || 0;

  // Trial conversion rate
  const { count: totalTrials } = await supabase
    .from("company_subscriptions")
    .select("*", { count: "exact", head: true })
    .in("status", ["trial_active", "trial_expired", "active"]);

  const trialConversionRate = totalTrials && paidSubscriptions 
    ? (paidSubscriptions / totalTrials) * 100 
    : 0;

  return {
    totalCompanies: totalCompanies || 0,
    totalUsers: totalUsers || 0,
    activeTrials: activeTrials || 0,
    paidSubscriptions: paidSubscriptions || 0,
    monthlyRevenue,
    trialConversionRate
  };
}

// Company Management
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

  if (error) throw error;
  return data;
}

export async function getCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select(`
      *,
      subscription:company_subscriptions(
        *,
        plan:subscription_plans(*)
      ),
      users(*),
      addons:company_addons(
        *,
        addon:addon_catalog(*)
      )
    `)
    .eq("id", companyId)
    .single();

  if (error) throw error;
  return data;
}

export async function createCompany(companyData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  planId?: string;
}) {
  // Create company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone,
      address: companyData.address,
      is_active: true
    })
    .select()
    .single();

  if (companyError) throw companyError;

  // Create subscription if plan provided
  if (companyData.planId) {
    const { error: subError } = await supabase
      .from("company_subscriptions")
      .insert({
        company_id: company.id,
        plan_id: companyData.planId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (subError) throw subError;
  }

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

// User Management
export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      company:companies(name),
      role:roles(name, display_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createUserForCompany(userData: {
  email: string;
  full_name: string;
  companyId: string;
  roleId: string;
  password: string;
}) {
  // This would need to be done via Supabase Admin API or Edge Function
  // For now, return a placeholder
  throw new Error("User creation requires backend implementation");
}

// Plan Management
export async function getAllPlans() {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data;
}

export async function createPlan(planData: Partial<Tables<"subscription_plans">>) {
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

// Subscription Management
export async function assignPlanToCompany(companyId: string, planId: string) {
  // Check if subscription exists
  const { data: existing } = await supabase
    .from("company_subscriptions")
    .select("id")
    .eq("company_id", companyId)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from("company_subscriptions")
      .update({
        plan_id: planId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from("company_subscriptions")
      .insert({
        company_id: companyId,
        plan_id: planId,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Add-on Management
export async function getAllAddons() {
  const { data, error } = await supabase
    .from("addon_catalog")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createAddon(addonData: Partial<Tables<"addon_catalog">>) {
  const { data, error } = await supabase
    .from("addon_catalog")
    .insert(addonData)
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

// Audit Logs
export async function getAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *,
      user:users(full_name, email),
      company:companies(name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Platform Settings
export async function getPlatformSettings() {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*");

  if (error) throw error;
  return data;
}

export async function updatePlatformSetting(key: string, value: unknown) {
  const { data, error } = await supabase
    .from("platform_settings")
    .update({ 
      setting_value: value as never,
      updated_at: new Date().toISOString()
    })
    .eq("setting_key", key)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Reports
export async function getCompanyGrowthReport(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("companies")
    .select("created_at")
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