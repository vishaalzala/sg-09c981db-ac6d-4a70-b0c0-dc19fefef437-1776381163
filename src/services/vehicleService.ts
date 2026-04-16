import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Vehicle = Tables<"vehicles">;
export type VehicleFile = Tables<"vehicle_files">;

export const vehicleService = {
  async searchVehicles(query: string, companyId: string, limit = 10) {
    const { data } = await supabase
      .from("vehicles")
      .select(`
        id, 
        registration_number, 
        make, 
        model, 
        year,
        customer:customers!vehicles_customer_id_fkey(id, name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`registration_number.ilike.%${query}%,vin.ilike.%${query}%,make.ilike.%${query}%,model.ilike.%${query}%`)
      .order("registration_number")
      .limit(limit);

    return data || [];
  },

  async getVehicle(id: string) {
    const { data } = await supabase
      .from("vehicles")
      .select(`
        *,
        customer:customers!vehicles_customer_id_fkey(*),
        files:vehicle_files(*),
        tags:vehicle_tags(tag:tags(*))
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    return data;
  },

  async getCustomerVehicles(customerId: string) {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("customer_id", customerId)
      .is("deleted_at", null)
      .order("registration_number");

    return data || [];
  },

  async createVehicle(vehicle: Partial<Vehicle>) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(vehicle as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    const { data, error } = await supabase
      .from("vehicles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async moveVehicle(vehicleId: string, newCustomerId: string, userId: string) {
    // Move vehicle to new customer and log the action
    const { data, error } = await supabase.rpc("move_vehicle", {
      vehicle_id: vehicleId,
      new_customer_id: newCustomerId,
      moved_by_user_id: userId,
    });

    if (error) throw error;
    return data;
  },

  async fetchCarjamData(rego: string, companyId: string, userId: string) {
    // This would call CARJAM API and create usage record
    // Placeholder for now - would be implemented as Edge Function
    const { data, error } = await supabase.functions.invoke("carjam-lookup", {
      body: { rego, company_id: companyId, user_id: userId },
    });

    if (error) throw error;
    return data;
  },
};