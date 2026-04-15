import { supabase } from "@/integrations/supabase/client";

export type SearchResult = {
  type: "customer" | "vehicle" | "booking" | "job" | "quote" | "invoice";
  id: string;
  title: string;
  subtitle: string;
  metadata?: string;
};

export const globalSearchService = {
  async search(query: string, companyId: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchTerm = query.trim();
    
    if (!searchTerm) return results;

    // Search customers
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, mobile, phone, email")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`name.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(5);

    customers?.forEach(c => {
      results.push({
        type: "customer",
        id: c.id,
        title: c.name,
        subtitle: c.mobile || c.phone || c.email || "",
        metadata: "Customer",
      });
    });

    // Search vehicles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select(`
        id, 
        registration_number, 
        make, 
        model, 
        year,
        customer:customers!vehicles_customer_id_fkey(name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`registration_number.ilike.%${searchTerm}%,vin.ilike.%${searchTerm}%`)
      .limit(5);

    vehicles?.forEach(v => {
      // Safely access customer name whether it's an object or array
      const custName = Array.isArray(v.customer) ? v.customer[0]?.name : v.customer?.name;
      
      results.push({
        type: "vehicle",
        id: v.id,
        title: `${v.registration_number} - ${v.make || ''} ${v.model || ''}`,
        subtitle: custName || "",
        metadata: v.year?.toString() || "Vehicle",
      });
    });

    // Search jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select(`
        id,
        order_number,
        job_title,
        status,
        customer:customers!jobs_customer_id_fkey(name),
        vehicle:vehicles!jobs_vehicle_id_fkey(registration_number)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .or(`order_number.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`)
      .limit(5);

    jobs?.forEach(j => {
      const custName = Array.isArray(j.customer) ? j.customer[0]?.name : j.customer?.name;
      const vehRego = Array.isArray(j.vehicle) ? j.vehicle[0]?.registration_number : j.vehicle?.registration_number;
      
      results.push({
        type: "job",
        id: j.id,
        title: `${j.order_number || ''} - ${j.job_title}`,
        subtitle: `${custName || ""} - ${vehRego || ""}`,
        metadata: j.status || "",
      });
    });

    // Search quotes
    const { data: quotes } = await supabase
      .from("quotes")
      .select(`
        id,
        quote_number,
        description,
        status,
        customer:customers!quotes_customer_id_fkey(name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .ilike("quote_number", `%${searchTerm}%`)
      .limit(5);

    quotes?.forEach(q => {
      results.push({
        type: "quote",
        id: q.id,
        title: `Quote ${q.quote_number}`,
        subtitle: q.customer?.name || "",
        metadata: q.status,
      });
    });

    // Search invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        status,
        customer:customers!invoices_customer_id_fkey(name)
      `)
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .ilike("invoice_number", `%${searchTerm}%`)
      .limit(5);

    invoices?.forEach(i => {
      results.push({
        type: "invoice",
        id: i.id,
        title: `Invoice ${i.invoice_number}`,
        subtitle: i.customer?.name || "",
        metadata: i.status,
      });
    });

    return results.slice(0, limit);
  },
};