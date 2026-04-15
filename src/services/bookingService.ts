import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;
type BookingInsert = Omit<Booking, "id" | "created_at" | "updated_at">;

export const bookingService = {
  async getBookings(companyId: string, branchId?: string, date?: string) {
    let query = supabase
      .from("bookings")
      .select(`
        *,
        customer:customers!bookings_customer_id_fkey(id, name, mobile),
        vehicle:vehicles!bookings_vehicle_id_fkey(id, registration_number, make, model),
        assigned_mechanic:users!bookings_assigned_mechanic_id_fkey(id, full_name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    if (date) {
      query = query.eq("booking_date", date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getBooking(id: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        customer:customers!bookings_customer_id_fkey(*),
        vehicle:vehicles!bookings_vehicle_id_fkey(*),
        assigned_mechanic:users!bookings_assigned_mechanic_id_fkey(id, full_name, email)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createBooking(booking: BookingInsert) {
    const { data, error } = await supabase
      .from("bookings")
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBooking(id: string, updates: Partial<Booking>) {
    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBooking(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  async convertToJob(bookingId: string, jobData: any) {
    // This will be implemented with the job creation logic
    // For now, return a placeholder
    return { success: true, jobId: "placeholder" };
  },
};