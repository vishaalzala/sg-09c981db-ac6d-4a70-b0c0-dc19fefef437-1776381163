import { supabase } from "@/integrations/supabase/client";
import { invoiceService } from "@/services/invoiceService";

export interface CreateInvoiceFromJobOptions {
    companyId: string;
    job: any;
    lineItems: any[];
}

export const jobService = {
    async generateJobNumber(companyId: string): Promise<string> {
        const { data, error } = await supabase
            .from("jobs")
            .select("job_number")
            .eq("company_id", companyId)
            .not("job_number", "is", null)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Error generating job number:", error);
            return `JOB-${Date.now()}`;
        }

        const last = data?.[0]?.job_number;
        if (!last) return "JOB-10001";
        const match = String(last).match(/(\d+)$/);
        if (!match) return `JOB-${Date.now()}`;
        return `JOB-${parseInt(match[1], 10) + 1}`;
    },

    async createInvoiceFromJob({ companyId, job, lineItems }: CreateInvoiceFromJobOptions) {
        const invoiceNumber = await invoiceService.generateInvoiceNumber(companyId);
        const invoiceDate = new Date().toISOString().split("T")[0];
        const dueDate = invoiceDate;

        const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
        const taxAmount = subtotal * 0.15;
        const totalAmount = subtotal + taxAmount;

        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert({
                company_id: companyId,
                customer_id: job.customer_id,
                vehicle_id: job.vehicle_id,
                job_id: job.id,
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate,
                due_date: dueDate,
                status: "unpaid",
                bill_to_third_party: job.third_party_name || null,
                invoice_to_third_party: job.invoice_to_third_party || false,
                payment_term: "COD",
                order_number: job.order_number || null,
                odometer: job.odometer || null,
                notes: job.description || job.job_title,
                subtotal,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                balance: totalAmount,
            } as any)
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        if (lineItems.length > 0) {
            const invoiceItems = lineItems.map((item, index) => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                line_total: item.line_total || 0,
                line_type: item.line_type || item.item_type || "item",
                sort_order: item.sort_order ?? index,
                notes: item.notes || null,
            }));

            const { error: itemsError } = await supabase
                .from("invoice_line_items")
                .insert(invoiceItems as any);

            if (itemsError) throw itemsError;
        }

        return invoice;
    },
};
