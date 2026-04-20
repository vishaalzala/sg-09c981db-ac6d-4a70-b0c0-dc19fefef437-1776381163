import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Invoice = Tables<"invoices">;
type InvoiceInsert = Omit<Invoice, "id" | "created_at" | "updated_at">;
type InvoiceLineItem = Tables<"invoice_line_items">;
type Payment = Tables<"payments">;

export const invoiceService = {
  async getInvoices(companyId: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        invoice_line_items(*)
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }

    return data || [];
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        invoice_line_items(*),
        salesperson:users!invoices_salesperson_id_fkey(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }

    return data;
  },

  async createInvoice(invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from("invoices")
      .insert(invoice as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addLineItem(lineItem: Omit<InvoiceLineItem, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("invoice_line_items")
      .insert(lineItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async recordPayment(payment: Omit<Payment, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select()
      .single();

    if (error) throw error;

    // Recalculate invoice balance and status
    if (data) {
      await this.recalculateInvoiceBalance(payment.invoice_id);
    }

    return data;
  },

  async recalculateInvoiceBalance(invoiceId: string) {
    // Get invoice total
    const { data: invoice } = await supabase
      .from("invoices")
      .select("total_amount")
      .eq("id", invoiceId)
      .single();

    // Get sum of payments
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("invoice_id", invoiceId);

    if (!invoice) return;

    const totalPaid = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const balance = (invoice.total_amount || 0) - totalPaid;

    let status = "unpaid";
    if (balance === 0) {
      status = "paid";
    } else if (totalPaid > 0) {
      status = "partially_paid";
    }

    // Check if overdue
    const { data: invoiceData } = await supabase
      .from("invoices")
      .select("due_date")
      .eq("id", invoiceId)
      .single();

    if (invoiceData?.due_date && new Date(invoiceData.due_date) < new Date() && balance > 0) {
      status = "overdue";
    }

    await supabase
      .from("invoices")
      .update({ balance, status })
      .eq("id", invoiceId);
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from("invoices")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async generateInvoiceNumber(companyId: string): Promise<string> {
    const { data, error } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error generating invoice number:", error);
      return `INV-${Date.now()}`;
    }

    if (!data || data.length === 0) {
      return "INV-10001";
    }

    const lastNumber = data[0].invoice_number;
    const match = lastNumber?.match(/INV-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `INV-${nextNumber}`;
    }

    return `INV-${Date.now()}`;
  },
};