import { supabase } from "@/integrations/supabase/client";
import type { Tables, Database } from "@/integrations/supabase/types";

export type CompanyWithDetails = Tables<"companies"> & {
    subscription: any;
    users: any[];
    addons: any[];
    branches: any[];
};

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
    // Fetch users (without role_id dependency)
    const { data: usersData, error } = await supabase
        .from("users")
        .select(`*, company:companies(name)`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getAllUsers error:", error);
        throw error;
    }

    // Fetch profiles separately since there is no direct FK between users and profiles
    const { data: profilesData } = await supabase.from("profiles").select("id, role");

    // Map profile.role to display format
    const usersWithRoles = usersData?.map(user => {
        const roleStr = profilesData?.find(p => p.id === user.id)?.role || "unknown";

        return {
            ...user,
            role: {
                name: roleStr,
                display_name: formatRoleName(roleStr)
            }
        };
    });

    return usersWithRoles || [];
}

export async function getUsersByCompany(companyId: string) {
    const { data: usersData, error } = await supabase
        .from("users")
        .select(`*`)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getUsersByCompany error:", error);
        throw error;
    }

    const { data: profilesData } = await supabase.from("profiles").select("id, role");

    const usersWithRoles = usersData?.map(user => {
        const roleStr = profilesData?.find(p => p.id === user.id)?.role || "unknown";

        return {
            ...user,
            role: {
                name: roleStr,
                display_name: formatRoleName(roleStr)
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch("/api/admin/plans", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(planData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create plan");
    }

    return response.json();
}

export async function updatePlan(planId: string, updates: Partial<Tables<"subscription_plans">>) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: planId, ...updates })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update plan");
    }

    return response.json();
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch("/api/admin/addons", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(addonData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create add-on");
    }

    return response.json();
}

export async function updateAddon(addonId: string, updates: Partial<Tables<"addon_catalog">>) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch("/api/admin/addons", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: addonId, ...updates })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update add-on");
    }

    return response.json();
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
// ============================================
// CONTROL CENTER / REVENUE OPS / PHASE 3-5
// ============================================

export interface AdminAlertItem {
    id: string;
    companyId?: string | null;
    companyName?: string | null;
    alertType: string;
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    message: string;
    createdAt: string;
}

export interface ControlCenterData {
    summary: {
        totalAlerts: number;
        trialsEndingSoon: number;
        inactiveCompanies: number;
        onboardingIncomplete: number;
    };
    alerts: AdminAlertItem[];
}

export interface RevenueSubscriptionItem {
    id: string;
    companyName?: string | null;
    stripeSubscriptionId?: string | null;
    planName?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
}

export interface RevenueOpsData {
    summary: {
        active: number;
        trialing: number;
        pastDue: number;
        renewingSoon: number;
    };
    subscriptions: RevenueSubscriptionItem[];
}

export interface NotificationTemplateItem {
    id: string;
    name: string;
    templateKey: string;
    channel: string;
    isActive: boolean;
}

export interface NotificationLogItem {
    id: string;
    templateKey?: string | null;
    subject?: string | null;
    recipient?: string | null;
    status: string;
    channel: string;
}

export interface NotificationsData {
    health: { smtpConfigured: boolean; senderConfigured: boolean };
    summary: { templateCount: number; sentLast7Days: number; failedLast7Days: number };
    templates: NotificationTemplateItem[];
    logs: NotificationLogItem[];
}

export interface TwilioNumberItem {
    id: string;
    phoneNumber: string;
    companyName?: string | null;
    isActive: boolean;
}

export interface SmsMessageItem {
    id: string;
    companyName?: string | null;
    fromNumber?: string | null;
    toNumber?: string | null;
    direction: string;
    status: string;
    body?: string | null;
}

export interface MessagingData {
    health: { twilioConfigured: boolean; messagingServiceConfigured: boolean };
    summary: { numberCount: number; messagesLast7Days: number; inboundLast7Days: number };
    numbers: TwilioNumberItem[];
    messages: SmsMessageItem[];
}

export interface LeadItem {
    id: string;
    name: string;
    email: string;
    companyName?: string | null;
    source?: string | null;
    message?: string | null;
    status: string;
    assignedToName?: string | null;
}

export interface LeadsData {
    summary: { newLeads: number; qualifiedLeads: number; convertedLeads: number; unassignedLeads: number };
    leads: LeadItem[];
}

export async function getControlCenterData(): Promise<ControlCenterData> {
    const [companiesRes, usersRes, subsRes] = await Promise.all([
        supabase.from("companies").select("id, name, created_at, updated_at, is_active").order("created_at", { ascending: false }),
        supabase.from("users").select("id, company_id, created_at, last_login_at"),
        supabase.from("company_subscriptions").select("company_id, status, trial_ends_at, current_period_end"),
    ]);

    const companies = companiesRes.data || [];
    const users = usersRes.data || [];
    const subscriptions = subsRes.data || [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const alerts: AdminAlertItem[] = [];

    const trialEndingSoon = subscriptions.filter((s: any) => {
        const end = s.trial_ends_at || s.current_period_end;
        if (!end || s.status !== "trial_active") return false;
        const dt = new Date(end);
        const now = new Date();
        const threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);
        return dt >= now && dt <= threeDays;
    });

    trialEndingSoon.forEach((sub: any, idx: number) => {
        const company = companies.find((c: any) => c.id === sub.company_id);
        alerts.push({
            id: `trial-${sub.company_id || idx}`,
            companyId: sub.company_id,
            companyName: company?.name,
            alertType: "trial_ending_soon",
            severity: "high",
            title: "Trial ending soon",
            message: `${company?.name || "A company"} has a trial ending on ${new Date(sub.trial_ends_at || sub.current_period_end).toLocaleDateString()}.`,
            createdAt: new Date().toISOString(),
        });
    });

    companies.forEach((company: any) => {
        const companyUsers = users.filter((u: any) => u.company_id === company.id);
        const mostRecentLogin = companyUsers
            .map((u: any) => u.last_login_at)
            .filter(Boolean)
            .sort()
            .reverse()[0];

        if (company.is_active && (!mostRecentLogin || new Date(mostRecentLogin) < sevenDaysAgo)) {
            alerts.push({
                id: `inactive-${company.id}`,
                companyId: company.id,
                companyName: company.name,
                alertType: "inactive_company",
                severity: "medium",
                title: "Inactive company",
                message: `${company.name} has no recent user login in the last 7 days.`,
                createdAt: new Date().toISOString(),
            });
        }

        if (companyUsers.length === 0) {
            alerts.push({
                id: `nouser-${company.id}`,
                companyId: company.id,
                companyName: company.name,
                alertType: "no_users_created",
                severity: "high",
                title: "No users created",
                message: `${company.name} has no active user records yet.`,
                createdAt: new Date().toISOString(),
            });
        }

        const subscription = subscriptions.find((s: any) => s.company_id === company.id);
        if (companyUsers.length <= 1 || !subscription) {
            alerts.push({
                id: `onboarding-${company.id}`,
                companyId: company.id,
                companyName: company.name,
                alertType: "onboarding_incomplete",
                severity: "low",
                title: "Onboarding incomplete",
                message: `${company.name} still looks incomplete. Review setup, users, and subscription state.`,
                createdAt: new Date().toISOString(),
            });
        }
    });

    return {
        summary: {
            totalAlerts: alerts.length,
            trialsEndingSoon: trialEndingSoon.length,
            inactiveCompanies: alerts.filter(a => a.alertType === "inactive_company").length,
            onboardingIncomplete: alerts.filter(a => a.alertType === "onboarding_incomplete").length,
        },
        alerts: alerts.slice(0, 20),
    };
}

export async function getRevenueOpsData(): Promise<RevenueOpsData> {
    const { data } = await (supabase as any)
        .from("subscriptions")
        .select("id, company_id, stripe_subscription_id, plan_name, status, current_period_end, companies(name)")
        .order("created_at", { ascending: false })
        .limit(25);

    const subscriptions = (data || []).map((row: any) => ({
        id: row.id,
        companyName: row.companies?.name || null,
        stripeSubscriptionId: row.stripe_subscription_id,
        planName: row.plan_name,
        status: row.status,
        currentPeriodEnd: row.current_period_end,
    }));

    const renewingSoon = subscriptions.filter((s: any) => {
        if (!s.currentPeriodEnd) return false;
        const now = new Date();
        const end = new Date(s.currentPeriodEnd);
        const soon = new Date();
        soon.setDate(soon.getDate() + 14);
        return end >= now && end <= soon;
    }).length;

    return {
        summary: {
            active: subscriptions.filter((s: any) => s.status === "active").length,
            trialing: subscriptions.filter((s: any) => s.status?.includes("trial")).length,
            pastDue: subscriptions.filter((s: any) => s.status === "past_due").length,
            renewingSoon,
        },
        subscriptions,
    };
}

export async function getNotificationsData(): Promise<NotificationsData> {
    const [templatesRes, logsRes, healthRes] = await Promise.all([
        (supabase as any).from("notification_templates").select("id, name, template_key, channel, is_active").order("created_at", { ascending: false }).limit(20),
        (supabase as any).from("notification_logs").select("id, template_key, subject, recipient, status, channel, created_at").order("created_at", { ascending: false }).limit(10),
        fetch("/api/admin/notifications/health").then(r => r.ok ? r.json() : { smtpConfigured: false, senderConfigured: false }).catch(() => ({ smtpConfigured: false, senderConfigured: false })),
    ]);

    const logs = logsRes.data || [];
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
        health: healthRes,
        summary: {
            templateCount: (templatesRes.data || []).length,
            sentLast7Days: logs.filter((l: any) => l.status === "sent" && (!l.created_at || l.created_at >= sevenDaysAgoIso)).length,
            failedLast7Days: logs.filter((l: any) => l.status === "failed" && (!l.created_at || l.created_at >= sevenDaysAgoIso)).length,
        },
        templates: (templatesRes.data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            templateKey: row.template_key,
            channel: row.channel,
            isActive: !!row.is_active,
        })),
        logs: logs.map((row: any) => ({
            id: row.id,
            templateKey: row.template_key,
            subject: row.subject,
            recipient: row.recipient,
            status: row.status,
            channel: row.channel,
        })),
    };
}

export async function getMessagingData(): Promise<MessagingData> {
    const [numbersRes, messagesRes, healthRes] = await Promise.all([
        (supabase as any).from("twilio_numbers").select("id, phone_number, company_id, is_active, companies(name)").order("created_at", { ascending: false }).limit(20),
        (supabase as any).from("sms_messages").select("id, company_id, from_number, to_number, direction, status, body, created_at, companies(name)").order("created_at", { ascending: false }).limit(20),
        fetch("/api/admin/messaging/health").then(r => r.ok ? r.json() : { twilioConfigured: false, messagingServiceConfigured: false }).catch(() => ({ twilioConfigured: false, messagingServiceConfigured: false })),
    ]);

    const messages = messagesRes.data || [];
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
        health: healthRes,
        summary: {
            numberCount: (numbersRes.data || []).length,
            messagesLast7Days: messages.filter((m: any) => !m.created_at || m.created_at >= sevenDaysAgoIso).length,
            inboundLast7Days: messages.filter((m: any) => m.direction === "inbound" && (!m.created_at || m.created_at >= sevenDaysAgoIso)).length,
        },
        numbers: (numbersRes.data || []).map((row: any) => ({
            id: row.id,
            phoneNumber: row.phone_number,
            companyName: row.companies?.name || null,
            isActive: !!row.is_active,
        })),
        messages: messages.map((row: any) => ({
            id: row.id,
            companyName: row.companies?.name || null,
            fromNumber: row.from_number,
            toNumber: row.to_number,
            direction: row.direction,
            status: row.status,
            body: row.body,
        })),
    };
}

export interface LeadItem {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    companyName?: string | null;
    source?: string | null;
    message?: string | null;
    status: string;
    assignedToId?: string | null;
    assignedToName?: string | null;
    createdAt?: string | null;
}

export async function getLeadsData(): Promise<LeadsData> {
    let rows: any[] = [];
    let usedLeadsTable = true;
    const leadsAttempt = await (supabase as any)
        .from("leads")
        .select("id, name, email, phone, company_name, source, message, status, assigned_to, created_at")
        .order("created_at", { ascending: false })
        .limit(25);

    if (leadsAttempt.error) {
        usedLeadsTable = false;
        const fallback = await (supabase as any)
            .from("lead_submissions")
            .select("id, name, email, phone, company_name, source, message, status, created_at")
            .order("created_at", { ascending: false })
            .limit(25);
        rows = fallback.data || [];
    } else {
        rows = leadsAttempt.data || [];
    }

    const assignedIds = rows.map((r: any) => r.assigned_to).filter(Boolean);
    const users = assignedIds.length
        ? ((await supabase.from("users").select("id, full_name").in("id", assignedIds)).data || [])
        : [];

    const leads: LeadItem[] = rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone ?? null,
        companyName: row.company_name ?? null,
        source: row.source ?? null,
        message: row.message ?? null,
        status: row.status || "new",
        assignedToId: usedLeadsTable ? row.assigned_to ?? null : null,
        assignedToName: usedLeadsTable ? users.find((u: any) => u.id === row.assigned_to)?.full_name || null : null,
        createdAt: row.created_at ?? null,
    }));

    return {
        summary: {
            newLeads: leads.filter((l) => l.status === "new").length,
            qualifiedLeads: leads.filter((l) => l.status === "qualified").length,
            convertedLeads: leads.filter((l) => l.status === "converted").length,
            unassignedLeads: leads.filter((l) => !l.assignedToName).length,
        },
        leads,
    };
}

export async function updateLeadStatus(leadId: string, status: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch("/api/admin/leads", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: leadId, status })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update lead status");
    }

    return response.json();
}

export async function assignLead(leadId: string, assignedTo: string | null) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch("/api/admin/leads", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: leadId, assigned_to: assignedTo })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign lead");
    }

    return response.json();
}


export async function getCompanyBillingHistory(companyId: string) {
    const { data, error } = await supabase
        .from("billing_events")
        .select("id, event_type, status, amount, currency, description, created_at")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    return data || [];
}

export async function getCompanyActivity(companyId: string) {
    const { data, error } = await supabase
        .from("audit_logs")
        .select("id, entity_type, action_type, changes, created_at")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    return data || [];
}
