import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Communication = Tables<"communications">;

export const communicationService = {
  async sendCommunication(communication: Omit<Communication, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("communications")
      .insert(communication)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCommunications(entityType: string, entityId: string) {
    const { data } = await supabase
      .from("communications")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    return data || [];
  },

  async getTemplates(companyId: string, templateType?: string) {
    let query = supabase
      .from("communication_templates")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true);

    if (templateType) {
      query = query.eq("template_type", templateType);
    }

    const { data } = await query.order("name");
    return data || [];
  },

  async createTemplate(template: any) {
    const { data, error } = await supabase
      .from("communication_templates")
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCommunicationStatus(id: string, status: string, metadata?: any) {
    const updates: any = { status };
    if (status === "sent") updates.sent_at = new Date().toISOString();
    if (status === "delivered") updates.delivered_at = new Date().toISOString();
    if (status === "failed") {
      updates.failed_at = new Date().toISOString();
      if (metadata?.error) updates.error_message = metadata.error;
    }

    const { error } = await supabase
      .from("communications")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  }
};