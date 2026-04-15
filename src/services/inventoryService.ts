import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type InventoryItem = Tables<"inventory_items">;
type InventoryItemInsert = Omit<InventoryItem, "id" | "created_at" | "updated_at">;
type InventoryMovement = Tables<"inventory_movements">;
type StockAdjustment = Tables<"stock_adjustments">;

export const inventoryService = {
  async getInventoryItems(companyId: string, branchId?: string) {
    let query = supabase
      .from("inventory_items")
      .select(`
        *,
        supplier:suppliers!inventory_items_supplier_id_fkey(id, name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("item_name");

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getInventoryItem(id: string) {
    const { data, error } = await supabase
      .from("inventory_items")
      .select(`
        *,
        supplier:suppliers!inventory_items_supplier_id_fkey(*),
        movements:inventory_movements(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createInventoryItem(item: InventoryItemInsert) {
    const { data, error } = await supabase
      .from("inventory_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const { data, error } = await supabase
      .from("inventory_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async recordMovement(movement: Omit<InventoryMovement, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("inventory_movements")
      .insert(movement)
      .select()
      .single();

    if (error) throw error;

    // Update stock level
    const { data: item } = await supabase
      .from("inventory_items")
      .select("quantity_on_hand")
      .eq("id", movement.inventory_item_id)
      .single();

    if (item) {
      const newQuantity = (item.quantity_on_hand || 0) + movement.quantity_change;
      await supabase
        .from("inventory_items")
        .update({ quantity_on_hand: newQuantity })
        .eq("id", movement.inventory_item_id);
    }

    return data;
  },

  async createStockAdjustment(adjustment: Omit<StockAdjustment, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("stock_adjustments")
      .insert(adjustment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInventoryItem(id: string) {
    const { error } = await supabase
      .from("inventory_items")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};