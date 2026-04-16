import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TimesheetEntry = Tables<"timesheet_entries">;

export const timesheetService = {
  async clockIn(companyId: string, userId: string, jobId?: string, notes?: string) {
    const { data, error } = await supabase
      .from("timesheet_entries")
      .insert({
        company_id: companyId,
        user_id: userId,
        job_id: jobId,
        clock_in: new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clockOut(entryId: string) {
    const clockOut = new Date();

    const { data: entry } = await supabase
      .from("timesheet_entries")
      .select("clock_in")
      .eq("id", entryId)
      .single();

    if (!entry) throw new Error("Entry not found");

    const clockIn = new Date(entry.clock_in);
    const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

    const { data, error } = await supabase
      .from("timesheet_entries")
      .update({
        clock_out: clockOut.toISOString(),
        hours_worked: hoursWorked,
        hours_billed: hoursWorked
      })
      .eq("id", entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTimesheets(companyId: string, filters?: {
    userId?: string;
    jobId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = supabase
      .from("timesheet_entries")
      .select("*, user:users!timesheet_entries_user_id_fkey(id, full_name)")
      .eq("company_id", companyId)
      .order("clock_in", { ascending: false });

    if (filters?.userId) query = query.eq("user_id", filters.userId);
    if (filters?.jobId) query = query.eq("job_id", filters.jobId);
    if (filters?.dateFrom) query = query.gte("clock_in", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("clock_in", filters.dateTo);

    const { data } = await query;
    return data || [];
  },

  async approveTimesheet(entryId: string, approvedBy: string) {
    const { data, error } = await supabase
      .from("timesheet_entries")
      .update({
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq("id", entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};