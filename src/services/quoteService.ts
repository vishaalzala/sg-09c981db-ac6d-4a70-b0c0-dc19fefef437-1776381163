import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Quote = Database["public"]["Tables"]["quotes"]["Row"];
type QuoteInsert = Database["public"]["Tables"]["quotes"]["Insert"];
type QuoteUpdate = Database["public"]["Tables"]["quotes"]["Update"];
type QuoteLineItem = Database["public"]["Tables"]["quote_line_items"]["Row"];

export const quoteService = {
  async getQuotes(companyId: string) {
    const { data, error } = await supabase
      .from("quotes")
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        quote_line_items(*)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quotes:", error);
      throw error;
    }

    return data || [];
  },

  async getQuoteById(id: string) {
    const { data, error } = await supabase
      .from("quotes")
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        quote_line_items(*),
        salesperson:users!quotes_salesperson_id_fkey(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching quote:", error);
      throw error;
    }

    return data;
  },

  async createQuote(quote: QuoteInsert) {
    const { data, error } = await supabase
      .from("quotes")
      .insert(quote)
      .select()
      .single();

    if (error) {
      console.error("Error creating quote:", error);
      throw error;
    }

    return data;
  },

  async updateQuote(id: string, updates: QuoteUpdate) {
    const { data, error } = await supabase
      .from("quotes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating quote:", error);
      throw error;
    }

    return data;
  },

  async deleteQuote(id: string) {
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting quote:", error);
      throw error;
    }
  },

  async addLineItem(quoteId: string, item: Database["public"]["Tables"]["quote_line_items"]["Insert"]) {
    const { data, error } = await supabase
      .from("quote_line_items")
      .insert({ ...item, quote_id: quoteId })
      .select()
      .single();

    if (error) {
      console.error("Error adding line item:", error);
      throw error;
    }

    return data;
  },

  async updateLineItem(itemId: string, updates: Database["public"]["Tables"]["quote_line_items"]["Update"]) {
    const { data, error } = await supabase
      .from("quote_line_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating line item:", error);
      throw error;
    }

    return data;
  },

  async deleteLineItem(itemId: string) {
    const { error } = await supabase
      .from("quote_line_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error deleting line item:", error);
      throw error;
    }
  },

  async searchCustomersAndVehicles(companyId: string, searchTerm: string) {
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("*, vehicles(*)")
      .eq("company_id", companyId)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(10);

    const { data: vehicles, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*, customer:customers(*)")
      .eq("company_id", companyId)
      .or(`registration_number.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
      .limit(10);

    if (customerError) console.error("Error searching customers:", customerError);
    if (vehicleError) console.error("Error searching vehicles:", vehicleError);

    return {
      customers: customers || [],
      vehicles: vehicles || []
    };
  },

  async generateQuoteNumber(companyId: string): Promise<string> {
    const { data, error } = await supabase
      .from("quotes")
      .select("quote_number")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error generating quote number:", error);
      return `QUO-${Date.now()}`;
    }

    if (!data || data.length === 0) {
      return "QUO-10001";
    }

    const lastNumber = data[0].quote_number;
    const match = lastNumber?.match(/QUO-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `QUO-${nextNumber}`;
    }

    return `QUO-${Date.now()}`;
  }
};