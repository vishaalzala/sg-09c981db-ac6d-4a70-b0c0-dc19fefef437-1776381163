import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ReminderType = Database["public"]["Tables"]["reminder_types"]["Row"];
type ReminderTypeInsert = Database["public"]["Tables"]["reminder_types"]["Insert"];

export const reminderTypeService = {
  async getReminderTypes(companyId: string) {
    const { data, error } = await supabase
      .from("reminder_types")
      .select("*")
      .eq("company_id", companyId)
      .order("is_system", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching reminder types:", error);
      throw error;
    }

    return data || [];
  },

  async createReminderType(reminderType: ReminderTypeInsert) {
    const { data, error } = await supabase
      .from("reminder_types")
      .insert(reminderType)
      .select()
      .single();

    if (error) {
      console.error("Error creating reminder type:", error);
      throw error;
    }

    return data;
  },

  async updateReminderType(id: string, name: string) {
    const { data, error } = await supabase
      .from("reminder_types")
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating reminder type:", error);
      throw error;
    }

    return data;
  },

  async deleteReminderType(id: string) {
    const { error } = await supabase
      .from("reminder_types")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting reminder type:", error);
      throw error;
    }
  }
};