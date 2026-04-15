import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SubscriptionPlan = Tables<"subscription_plans">;
type CompanySubscription = Tables<"company_subscriptions">;
type AddonCatalog = Tables<"addon_catalog">;
type CompanyAddon = Tables<"company_addons">;
type UsageRecord = Tables<"usage_records">;
type BillingEvent = Tables<"billing_events">;

export const billingService = {
  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("monthly_price");

    if (error) throw error;
    return data || [];
  },

  async getCompanySubscription(companyId: string) {
    const { data, error } = await supabase
      .from("company_subscriptions")
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq("company_id", companyId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  },

  async getAddonCatalog() {
    const { data, error } = await supabase
      .from("addon_catalog")
      .select("*")
      .eq("is_available", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async getCompanyAddons(companyId: string) {
    const { data, error } = await supabase
      .from("company_addons")
      .select(`
        *,
        addon:addon_catalog(*)
      `)
      .eq("company_id", companyId)
      .eq("is_enabled", true);

    if (error) throw error;
    return data || [];
  },

  async enableAddon(companyId: string, addonId: string, enabledBy: string) {
    const { data, error } = await supabase
      .from("company_addons")
      .insert({
        company_id: companyId,
        addon_id: addonId,
        is_enabled: true,
        enabled_at: new Date().toISOString(),
        enabled_by: enabledBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async disableAddon(id: string) {
    const { data, error } = await supabase
      .from("company_addons")
      .update({ is_enabled: false, disabled_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async recordUsage(usage: Omit<UsageRecord, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("usage_records")
      .insert(usage)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUsageRecords(companyId: string, filters?: { featureSlug?: string; startDate?: string; endDate?: string }) {
    let query = supabase
      .from("usage_records")
      .select("*")
      .eq("company_id", companyId)
      .order("timestamp", { ascending: false });

    if (filters?.featureSlug) {
      query = query.eq("feature_slug", filters.featureSlug);
    }
    if (filters?.startDate) {
      query = query.gte("timestamp", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("timestamp", filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getUsageSummary(companyId: string, featureSlug: string, startDate: string, endDate: string) {
    const records = await this.getUsageRecords(companyId, { featureSlug, startDate, endDate });
    
    const totalUsage = records.reduce((sum, r) => sum + (r.quantity || 1), 0);
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

    return { totalUsage, totalCost, records };
  },

  async recordBillingEvent(event: Omit<BillingEvent, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("billing_events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};