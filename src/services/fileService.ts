import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type FileRecord = Tables<"files">;

export const fileService = {
  async uploadFile(
    companyId: string,
    entityType: string,
    entityId: string,
    file: File,
    category?: string,
    uploadedBy?: string
  ) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${entityType}/${entityId}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from("files")
      .insert({
        company_id: companyId,
        entity_type: entityType,
        entity_id: entityId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        category,
        uploaded_by: uploadedBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFiles(entityType: string, entityId: string) {
    const { data } = await supabase
      .from("files")
      .select("*, uploader:users!files_uploaded_by_fkey(id, full_name)")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    return data || [];
  },

  async deleteFile(id: string) {
    const { error } = await supabase
      .from("files")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }
};