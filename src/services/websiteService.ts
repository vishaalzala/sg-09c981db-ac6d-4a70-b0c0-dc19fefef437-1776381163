import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Website = Tables<"websites">;

export const websiteService = {
  async getCompanyWebsite(companyId: string) {
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("company_id", companyId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async createWebsite(website: Omit<Website, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("websites")
      .insert(website)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWebsite(id: string, updates: Partial<Website>) {
    const { data, error } = await supabase
      .from("websites")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async checkSubdomainAvailability(subdomain: string, excludeId?: string) {
    const reservedWords = [
      "admin", "app", "api", "support", "billing", "dashboard",
      "www", "mail", "smtp", "ftp", "blog", "shop", "store"
    ];

    if (reservedWords.includes(subdomain.toLowerCase())) {
      return { available: false, reason: "reserved" };
    }

    let query = supabase
      .from("websites")
      .select("id")
      .eq("subdomain", subdomain);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.single();
    return { available: !data, reason: data ? "taken" : null };
  },

  async addCustomDomain(websiteId: string, companyId: string, domain: string) {
    const { data, error } = await supabase
      .from("website_domains")
      .insert({
        company_id: companyId,
        website_id: websiteId,
        domain,
        verification_status: "pending",
        ssl_status: "pending"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWebsiteDomains(websiteId: string) {
    const { data } = await supabase
      .from("website_domains")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: false });

    return data || [];
  },

  async removeDomain(domainId: string) {
    const { error } = await supabase
      .from("website_domains")
      .delete()
      .eq("id", domainId);

    if (error) throw error;
  },

  async trackAnalytics(websiteId: string, companyId: string, metric: string) {
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("website_analytics")
      .select("*")
      .eq("website_id", websiteId)
      .eq("date", today)
      .single();

    if (existing) {
      const updates: any = {};
      if (metric === "page_view") updates.page_views = (existing.page_views || 0) + 1;
      if (metric === "booking") updates.booking_submissions = (existing.booking_submissions || 0) + 1;
      if (metric === "lead") updates.lead_submissions = (existing.lead_submissions || 0) + 1;

      await supabase
        .from("website_analytics")
        .update(updates)
        .eq("id", existing.id);
    } else {
      const record: any = {
        company_id: companyId,
        website_id: websiteId,
        date: today,
        page_views: metric === "page_view" ? 1 : 0,
        booking_submissions: metric === "booking" ? 1 : 0,
        lead_submissions: metric === "lead" ? 1 : 0
      };

      await supabase.from("website_analytics").insert(record);
    }
  },

  async getAnalytics(websiteId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await supabase
      .from("website_analytics")
      .select("*")
      .eq("website_id", websiteId)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    return data || [];
  }
};