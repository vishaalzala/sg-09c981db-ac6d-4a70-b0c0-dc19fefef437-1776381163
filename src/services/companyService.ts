import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type Branch = Tables<"branches">;

export const companyService = {
  async getCurrentCompany(): Promise<Company | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!userData?.company_id) return null;

    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", userData.company_id)
      .is("deleted_at", null)
      .single();

    return data;
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