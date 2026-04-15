import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type WofInspection = Tables<"wof_inspections">;
type WofInspectionInsert = Omit<WofInspection, "id" | "created_at" | "updated_at">;
type WofInspectionItem = Tables<"wof_inspection_items">;
type WofRecheck = Tables<"wof_rechecks">;
type InspectorCertification = Tables<"inspector_certifications">;
type InspectionEquipment = Tables<"inspection_equipment">;

export const wofService = {
  async getInspections(companyId: string, filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    let query = supabase
      .from("wof_inspections")
      .select(`
        *,
        customer:customers!wof_inspections_customer_id_fkey(id, name),
        vehicle:vehicles!wof_inspections_vehicle_id_fkey(id, registration_number, make, model),
        inspector:users!wof_inspections_inspector_id_fkey(id, full_name)
      `)
      .eq("company_id", companyId)
      .order("inspection_date", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte("inspection_date", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("inspection_date", filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getInspection(id: string) {
    const { data, error } = await supabase
      .from("wof_inspections")
      .select(`
        *,
        customer:customers!wof_inspections_customer_id_fkey(*),
        vehicle:vehicles!wof_inspections_vehicle_id_fkey(*),
        inspector:users!wof_inspections_inspector_id_fkey(*),
        items:wof_inspection_items(*),
        rechecks:wof_rechecks(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createInspection(inspection: WofInspectionInsert) {
    const { data, error } = await supabase
      .from("wof_inspections")
      .insert(inspection)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInspection(id: string, updates: Partial<WofInspection>) {
    const { data, error } = await supabase
      .from("wof_inspections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addInspectionItem(item: Omit<WofInspectionItem, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("wof_inspection_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createRecheck(recheck: Omit<WofRecheck, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("wof_rechecks")
      .insert(recheck)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInspectorCertifications(companyId: string) {
    const { data, error } = await supabase
      .from("inspector_certifications")
      .select(`
        *,
        inspector:users!inspector_certifications_inspector_id_fkey(id, full_name, email)
      `)
      .eq("company_id", companyId)
      .order("expiry_date", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getEquipment(companyId: string) {
    const { data, error } = await supabase
      .from("inspection_equipment")
      .select(`
        *,
        calibrations:equipment_calibrations(*)
      `)
      .eq("company_id", companyId)
      .order("equipment_name");

    if (error) throw error;
    return data || [];
  },

  async logCompliance(log: {
    company_id: string;
    inspection_id: string;
    event_type: string;
    event_data: any;
    performed_by: string;
  }) {
    const { data, error } = await supabase
      .from("wof_compliance_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};