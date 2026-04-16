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
        .single();

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
        .single();

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

  async getCompanyBranches(companyId: string): Promise<Branch[]> {
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name");

    return data || [];
  },

  async getCompanyAddons(companyId: string) {
    const { data } = await supabase
      .from("company_addons")
      .select(`
        *,
        addon:addon_catalog(*)
      `)
      .eq("company_id", companyId)
      .eq("is_enabled", true);

    return data || [];
  },

  async checkFeatureEntitlement(companyId: string, featureSlug: string): Promise<boolean> {
    const { data } = await supabase
      .from("feature_entitlements")
      .select("id")
      .eq("company_id", companyId)
      .eq("feature_name", featureSlug)
      .eq("is_enabled", true)
      .single();

    return !!data;
  },
};