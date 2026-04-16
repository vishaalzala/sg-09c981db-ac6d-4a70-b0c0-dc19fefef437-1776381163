import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Discount = Tables<"discounts">;

export const discountService = {
  // Apply discount to quote or invoice
  async applyDiscount(data: {
    company_id: string;
    entity_type: "quote" | "invoice";
    entity_id: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    subtotal: number;
    reason?: string;
  }) {
    const discount_amount = data.discount_type === "percentage" 
      ? (data.subtotal * data.discount_value / 100)
      : data.discount_value;

    const { data: discount, error } = await supabase
      .from("discounts")
      .insert({
        company_id: data.company_id,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount,
        reason: data.reason,
        applied_by: null
      })
      .select()
      .single();

    if (error) throw error;

    // Update the entity with discount
    const table = data.entity_type === "quote" ? "quotes" : "invoices";
    const newSubtotal = data.subtotal - discount_amount;
    const newTax = newSubtotal * 0.15; // 15% GST
    const newTotal = newSubtotal + newTax;

    await supabase
      .from(table as any)
      .update({
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal
      })
      .eq("id", data.entity_id);

    return discount;
  },

  // Get discount for entity
  async getDiscount(entityType: "quote" | "invoice", entityId: string) {
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("applied_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Remove discount
  async removeDiscount(entityType: "quote" | "invoice", entityId: string, originalSubtotal: number) {
    const table = entityType === "quote" ? "quotes" : "invoices";
    const newTax = originalSubtotal * 0.15;
    const newTotal = originalSubtotal + newTax;

    await supabase
      .from(table as any)
      .update({
        discount_type: null,
        discount_value: 0,
        discount_amount: 0,
        subtotal: originalSubtotal,
        tax: newTax,
        total: newTotal
      })
      .eq("id", entityId);

    return { success: true };
  }
};