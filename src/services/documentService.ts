import { supabase } from "@/integrations/supabase/client";

export const documentService = {
  async generatePDF(documentType: string, entityId: string, companyId: string) {
    // This will be integrated with a PDF generation service
    // For now, return a placeholder
    return {
      url: `/api/documents/${documentType}/${entityId}.pdf`,
      filename: `${documentType}-${entityId}.pdf`
    };
  },

  async sendDocument(
    companyId: string,
    entityType: string,
    entityId: string,
    documentType: string,
    recipient: string,
    createdBy: string
  ) {
    const { data, error } = await supabase
      .from("document_history")
      .insert({
        company_id: companyId,
        entity_type: entityType,
        entity_id: entityId,
        document_type: documentType,
        action: "email",
        recipient,
        sent_at: new Date().toISOString(),
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDocumentHistory(entityType: string, entityId: string) {
    const { data } = await supabase
      .from("document_history")
      .select("*, sender:users!document_history_created_by_fkey(id, full_name)")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    return data || [];
  },

  async getTemplates(companyId: string, templateType?: string) {
    let query = supabase
      .from("document_templates")
      .select("*")
      .eq("company_id", companyId);

    if (templateType) {
      query = query.eq("template_type", templateType);
    }

    const { data } = await query.order("name");
    return data || [];
  }
};