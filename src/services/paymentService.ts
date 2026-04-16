import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const paymentService = {
  // Get payment methods for company
  async getPaymentMethods(companyId: string) {
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("display_order");

    if (error) throw error;
    return data || [];
  },

  // Create payment method
  async createPaymentMethod(method: any) {
    const { data, error } = await supabase
      .from("payment_methods")
      .insert(method)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update payment method
  async updatePaymentMethod(id: string, updates: any) {
    const { error } = await supabase
      .from("payment_methods")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  // Delete payment method
  async deletePaymentMethod(id: string) {
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Reorder payment methods
  async reorderPaymentMethods(methods: { id: string; display_order: number }[]) {
    for (const method of methods) {
      await supabase
        .from("payment_methods")
        .update({ display_order: method.display_order })
        .eq("id", method.id);
    }
  },

  // Create payment with splits
  async createPayment(invoiceId: string, paymentData: any) {
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        company_id: paymentData.company_id,
        amount: paymentData.totalAmount,
        payment_date: paymentData.date,
        reference: paymentData.reference,
        notes: paymentData.notes,
        payment_method_id: paymentData.splits?.length === 1 ? paymentData.splits[0].payment_method_id : null,
        fee_amount: paymentData.totalFees,
        is_split: paymentData.splits?.length > 1,
        created_by: paymentData.created_by
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Create split records if multiple methods
    if (paymentData.splits && paymentData.splits.length > 0) {
      const splits = paymentData.splits.map((split: any) => ({
        payment_id: payment.id,
        payment_method_id: split.payment_method_id,
        method_name: split.method_name,
        amount: split.amount,
        fee_amount: split.fee_amount,
        total_amount: split.total_amount
      }));

      const { error: splitsError } = await supabase
        .from("payment_splits")
        .insert(splits);

      if (splitsError) throw splitsError;
    }

    return payment;
  },

  // Get payment history for invoice
  async getPaymentHistory(invoiceId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        payment_method:payment_methods(name),
        splits:payment_splits(
          *,
          payment_method:payment_methods(name)
        )
      `)
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Calculate total paid for invoice
  async calculateTotalPaid(invoiceId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select("amount")
      .eq("invoice_id", invoiceId);

    if (error) throw error;

    return data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  }
};