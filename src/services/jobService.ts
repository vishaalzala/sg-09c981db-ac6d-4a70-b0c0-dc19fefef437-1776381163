import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Job = Tables<"jobs">;
type JobInsert = Omit<Job, "id" | "created_at" | "updated_at">;
type JobLineItem = Tables<"job_line_items">;

export const jobService = {
  async getJobs(companyId: string, branchId?: string, status?: string) {
    let query = supabase
      .from("jobs")
      .select(`
        *,
        customer:customers!jobs_customer_id_fkey(id, name, mobile, email),
        vehicle:vehicles!jobs_vehicle_id_fkey(id, registration_number, make, model, year),
        assigned_mechanics:users!jobs_assigned_mechanic_ids_fkey(id, full_name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getJob(id: string) {
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        customer:customers!jobs_customer_id_fkey(*),
        vehicle:vehicles!jobs_vehicle_id_fkey(*),
        line_items:job_line_items(*),
        attachments:job_attachments(*),
        status_history:job_status_history(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createJob(job: JobInsert) {
    const { data, error } = await supabase
      .from("jobs")
      .insert(job)
      .select()
      .single();

    if (error) throw error;

    // Create initial status history entry
    if (data) {
      await supabase.from("job_status_history").insert({
        job_id: data.id,
        to_status: data.status,
        changed_by: job.created_by,
        notes: "Job created",
      });
    }

    return data;
  },

  async updateJob(id: string, updates: Partial<Job>) {
    const { data, error } = await supabase
      .from("jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateJobStatus(id: string, status: string, userId: string, notes?: string) {
    // Get current status first
    const { data: currentJob } = await supabase
      .from("jobs")
      .select("status")
      .eq("id", id)
      .single();

    const from_status = currentJob?.status;

    const { data, error } = await supabase
      .from("jobs")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Add status history
    await supabase.from("job_status_history").insert({
      job_id: id,
      from_status,
      to_status: status,
      changed_by: userId,
      notes: notes || `Status changed to ${status}`,
    });

    return data;
  },

  async addLineItem(lineItem: Omit<JobLineItem, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("job_line_items")
      .insert(lineItem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateLineItem(id: string, updates: Partial<JobLineItem>) {
    const { data, error } = await supabase
      .from("job_line_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLineItem(id: string) {
    const { error } = await supabase
      .from("job_line_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async deleteJob(id: string) {
    const { error } = await supabase
      .from("jobs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },
};