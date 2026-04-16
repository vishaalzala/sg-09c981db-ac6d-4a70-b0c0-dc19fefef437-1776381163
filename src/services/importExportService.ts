import { supabase } from "@/integrations/supabase/client";

export const importExportService = {
  async createImportHistory(companyId: string, data: {
    import_type: string;
    file_name: string;
    total_rows: number;
    created_by: string;
  }) {
    const { data: record, error } = await supabase
      .from("import_history")
      .insert({
        company_id: companyId,
        ...data,
        status: "processing"
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  async updateImportHistory(id: string, updates: {
    status?: string;
    success_rows?: number;
    failed_rows?: number;
    errors?: any;
  }) {
    const { data, error } = await supabase
      .from("import_history")
      .update({ ...updates, completed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getImportHistory(companyId: string) {
    const { data } = await supabase
      .from("import_history")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50);

    return data || [];
  },

  async exportToCSV(companyId: string, entityType: string, filters?: any) {
    let query: any = supabase.from(entityType as any).select("*").eq("company_id", companyId);

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }
};