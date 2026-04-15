import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Reminder = Tables<"reminders">;
type ReminderInsert = Omit<Reminder, "id" | "created_at" | "updated_at">;

export const reminderService = {
  async getReminders(companyId: string, filters?: { status?: string; type?: string; customerId?: string; vehicleId?: string }) {
    let query = supabase
      .from("reminders")
      .select(`
        *,
        customer:customers!reminders_customer_id_fkey(id, name, mobile, email),
        vehicle:vehicles!reminders_vehicle_id_fkey(id, registration_number, make, model)
      `)
      .eq("company_id", companyId)
      .order("due_date", { ascending: true });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.type) {
      query = query.eq("reminder_type", filters.type);
    }
    if (filters?.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }
    if (filters?.vehicleId) {
      query = query.eq("vehicle_id", filters.vehicleId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getUpcomingReminders(companyId: string, daysAhead = 30) {
    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        customer:customers!reminders_customer_id_fkey(id, name, mobile, email),
        vehicle:vehicles!reminders_vehicle_id_fkey(id, registration_number, make, model)
      `)
      .eq("company_id", companyId)
      .eq("status", "pending")
      .gte("due_date", today)
      .lte("due_date", futureDateStr)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createReminder(reminder: ReminderInsert) {
    const { data, error } = await supabase
      .from("reminders")
      .insert(reminder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReminder(id: string, updates: Partial<Reminder>) {
    const { data, error } = await supabase
      .from("reminders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsSent(id: string) {
    const { data, error } = await supabase
      .from("reminders")
      .update({
        status: "sent",
        last_sent_date: new Date().toISOString(),
      } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsCompleted(id: string) {
    const { data, error } = await supabase
      .from("reminders")
      .update({ status: "completed" } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};