import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Quote = Tables<"quotes">;
type QuoteInsert = Omit<Quote, "id" | "created_at" | "updated_at">;
type QuoteLineItem = Tables<"quote_line_items">;

export const quoteService = {
  async getQuotes(companyId: string, status?: string) {
    let query = supabase
      .from("quotes")
      .select(`
        *,
        customer:customers!quotes_customer_id_fkey(id, name, mobile, email),
        vehicle:vehicles!quotes_vehicle_id_fkey(id, registration_number, make, model)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getQuote(id: string) {
    const { data, error } = await supabase
      .from("quotes")
      .select(`
        *,
        customer:customers!quotes_customer_id_fkey(*),
        vehicle:vehicles!quotes_vehicle_id_fkey(*),
        line_items:quote_line_items(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createQuote(quote: QuoteInsert) {
    const { data, error } = await supabase
      .from("quotes")
      .insert(quote)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuote(id: string, updates: Partial<Quote>) {
    const { data, error } = await supabase
      .from("quotes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async approveQuote(id: string, userId: string) {
    return this.updateQuote(id, {
      status: "approved",
      approval_status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    });
  },

  async declineQuote(id: string, reason?: string) {
    return this.updateQuote(id, {
      status: "declined",
      approval_status: "declined",
      decline_reason: reason,
    });
  },

  async addLineItem(lineItem: Omit<QuoteLineItem, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("quote_line_items")
      .insert(lineItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuote(id: string) {
    const { error } = await supabase
      .from("quotes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};