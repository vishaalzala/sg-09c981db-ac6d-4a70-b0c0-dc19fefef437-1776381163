import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type Branch = Tables<"branches">;

export const companyService = {
  async getCurrentCompany(): Promise<Company | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single() as any;

      if (userError) {
        console.error("Error fetching user data:", userError);
        return null;
      }

      if (!userData?.company_id) {
        console.error("User has no company_id assigned");
        return null;
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", userData.company_id)
        .is("deleted_at", null)
        .single() as any;

      if (error) {
        console.error("Error fetching company:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Unexpected error in getCurrentCompany:", error);
      return null;
    }
  },

  async validateUserCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    try {
      const { data } = await (supabase as any)
        .from("users")
        .select("company_id, profiles!inner(role)")
        .eq("id", userId)
        .single();

      if (!data) return false;

      // Super admin can access all companies
      if (data.profiles?.role === "super_admin") return true;

      // User must belong to the company
      return data.company_id === companyId;
    } catch (error) {
      return false;
    }
  },

  async getCompanyBranches(companyId: string): Promise<Branch[]> {
    // Validate access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const hasAccess = await this.validateUserCompanyAccess(user.id, companyId);
    if (!hasAccess) {
      console.error("Access denied: User does not belong to this company");
      return [];
    }

    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name") as any;

    return data || [];
  },

  async getCompanyAddons(companyId: string) {
    // Validate access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const hasAccess = await this.validateUserCompanyAccess(user.id, companyId);
    if (!hasAccess) {
      console.error("Access denied: User does not belong to this company");
      return [];
    }

    const { data } = await supabase
      .from("company_addons")
      .select(`
        *,
        addon:addon_catalog(*)
      `)
      .eq("company_id", companyId)
      .eq("is_enabled", true) as any;

    return data || [];
  },

  async checkFeatureEntitlement(companyId: string, featureSlug: string): Promise<boolean> {
    // Validate access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const hasAccess = await this.validateUserCompanyAccess(user.id, companyId);
    if (!hasAccess) {
      console.error("Access denied: User does not belong to this company");
      return false;
    }

    const { data } = await supabase
      .from("feature_entitlements")
      .select("id")
      .eq("company_id", companyId)
      .eq("feature_name", featureSlug)
      .eq("is_enabled", true)
      .single() as any;

    return !!data;
  },
};