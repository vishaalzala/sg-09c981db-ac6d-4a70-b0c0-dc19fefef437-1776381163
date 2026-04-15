import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Supplier = Tables<"suppliers">;
type SupplierInsert = Omit<Supplier, "id" | "created_at" | "updated_at">;
type SupplierContact = Tables<"supplier_contacts">;

export const supplierService = {
  async getSuppliers(companyId: string) {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async getSupplier(id: string) {
    const { data, error } = await supabase
      .from("suppliers")
      .select(`
        *,
        contacts:supplier_contacts(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createSupplier(supplier: SupplierInsert) {
    const { data, error } = await supabase
      .from("suppliers")
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const { data, error } = await supabase
      .from("suppliers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSupplier(id: string) {
    const { error } = await supabase
      .from("suppliers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async addContact(contact: Omit<SupplierContact, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("supplier_contacts")
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};