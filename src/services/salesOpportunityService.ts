import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type SalesOpportunity = Tables<"sales_opportunities">;

export const salesOpportunityService = {
  // Create opportunity
  async createOpportunity(data: Partial<SalesOpportunity>) {
    const { data: opportunity, error } = await supabase
      .from("sales_opportunities")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return opportunity;
  },

  // Get opportunities for customer
  async getOpportunitiesByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from("sales_opportunities")
      .select("*")
      .eq("customer_id", customerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get opportunities for vehicle
  async getOpportunitiesByVehicle(vehicleId: string) {
    const { data, error } = await supabase
      .from("sales_opportunities")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all opportunities for company
  async getOpportunities(companyId: string, filters?: {
    status?: string;
    priority?: string;
  }) {
    let query = supabase
      .from("sales_opportunities")
      .select(`
        *,
        customer:customers(full_name, mobile),
        vehicle:vehicles(registration, make, model)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Update opportunity
  async updateOpportunity(id: string, data: Partial<SalesOpportunity>) {
    const { data: updated, error } = await supabase
      .from("sales_opportunities")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  // Convert to quote
  async convertToQuote(opportunityId: string, quoteId: string) {
    const { data, error } = await supabase
      .from("sales_opportunities")
      .update({
        status: "converted",
        converted_to_type: "quote",
        converted_to_id: quoteId,
        converted_at: new Date().toISOString()
      })
      .eq("id", opportunityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Convert to job
  async convertToJob(opportunityId: string, jobId: string) {
    const { data, error } = await supabase
      .from("sales_opportunities")
      .update({
        status: "converted",
        converted_to_type: "job",
        converted_to_id: jobId,
        converted_at: new Date().toISOString()
      })
      .eq("id", opportunityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Soft delete
  async deleteOpportunity(id: string) {
    const { error } = await supabase
      .from("sales_opportunities")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  }
};