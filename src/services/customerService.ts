import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Customer = Tables<"customers">;
export type CustomerContact = Tables<"customer_contacts">;
export type CustomerNote = Tables<"customer_notes">;
export type CustomerAddress = Tables<"customer_addresses">;

export const customerService = {
  async searchCustomers(query: string, companyId: string, limit = 10) {
    const { data } = await supabase
      .from("customers")
      .select("id, name, is_company, mobile, phone, email")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`name.ilike.%${query}%,mobile.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order("name")
      .limit(limit);

    return data || [];
  },

  async getCustomer(id: string) {
    const { data } = await supabase
      .from("customers")
      .select(`
        *,
        addresses:customer_addresses(*),
        contacts:customer_contacts(*),
        tags:customer_tags(tag:tags(*))
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    return data;
  },

  async createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("customers")
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from("customers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async mergeCustomers(targetId: string, sourceId: string) {
    // This would be implemented as a database function or transaction
    // to move all related records from source to target customer
    const { data, error } = await supabase.rpc("merge_customers", {
      target_customer_id: targetId,
      source_customer_id: sourceId,
    });

    if (error) throw error;
    return data;
  },

  async getCustomerNotes(customerId: string) {
    const { data } = await supabase
      .from("customer_notes")
      .select(`
        *,
        created_by_user:users!customer_notes_created_by_fkey(full_name)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    return data || [];
  },

  async createCustomerNote(note: Omit<CustomerNote, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("customer_notes")
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};