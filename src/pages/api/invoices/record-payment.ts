import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const admin = getSupabaseAdmin();

        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "Missing auth token" });
        }

        const {
            data: { user },
            error: userError,
        } = await admin.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({ error: "Invalid user session" });
        }

        const {
            invoiceId,
            amount,
            paymentMethod,
            paymentDate,
            reference,
            notes,
        } = req.body;

        if (!invoiceId || !amount || Number(amount) <= 0 || !paymentMethod) {
            return res.status(400).json({
                error: "Invoice, amount, and payment method are required.",
            });
        }

        const { data: userRow, error: userRowError } = await admin
            .from("users")
            .select("company_id")
            .eq("id", user.id)
            .single();

        if (userRowError || !userRow?.company_id) {
            return res.status(403).json({ error: "No company found for this user." });
        }

        const companyId = userRow.company_id;

        const { data: invoice, error: invoiceError } = await admin
            .from("invoices")
            .select("id, company_id, customer_id, total, total_amount, amount, status")
            .eq("id", invoiceId)
            .eq("company_id", companyId)
            .single();

        if (invoiceError || !invoice) {
            return res.status(404).json({ error: "Invoice not found." });
        }

        const invoiceTotal =
            Number(invoice.total || 0) ||
            Number(invoice.total_amount || 0) ||
            Number(invoice.amount || 0);

        const { data: existingPayments, error: existingPaymentsError } = await admin
            .from("payments")
            .select("amount")
            .eq("invoice_id", invoiceId)
            .eq("company_id", companyId);

        if (existingPaymentsError) {
            throw existingPaymentsError;
        }

        const paidBefore = (existingPayments || []).reduce(
            (sum: number, payment: any) => sum + Number(payment.amount || 0),
            0
        );

        const paymentAmount = Number(amount);
        const paidAfter = paidBefore + paymentAmount;

        const nextStatus =
            invoiceTotal > 0 && paidAfter >= invoiceTotal ? "paid" : "partially_paid";

        const now = new Date().toISOString();

        const { data: payment, error: paymentError } = await admin
            .from("payments")
            .insert({
                company_id: companyId,
                invoice_id: invoiceId,
                customer_id: invoice.customer_id || null,
                amount: paymentAmount,
                payment_method: paymentMethod,
                payment_date: paymentDate || now,
                reference: reference || null,
                notes: notes || null,
                status: "completed",
                created_by: user.id,
                created_at: now,
                updated_at: now,
            })
            .select("id")
            .single();

        if (paymentError) {
            throw paymentError;
        }

        const { error: updateInvoiceError } = await admin
            .from("invoices")
            .update({
                status: nextStatus,
                paid_amount: paidAfter,
                balance_due: Math.max(invoiceTotal - paidAfter, 0),
                paid_at: nextStatus === "paid" ? now : null,
                updated_at: now,
            })
            .eq("id", invoiceId)
            .eq("company_id", companyId);

        if (updateInvoiceError) {
            throw updateInvoiceError;
        }

        await admin.from("audit_logs").insert({
            company_id: companyId,
            user_id: user.id,
            action: "invoice_payment_recorded",
            entity_type: "invoice",
            entity_id: invoiceId,
            metadata: {
                payment_id: payment.id,
                amount: paymentAmount,
                payment_method: paymentMethod,
                invoice_total: invoiceTotal,
                paid_before: paidBefore,
                paid_after: paidAfter,
                status: nextStatus,
            },
            created_at: now,
        } as any);

        return res.status(200).json({
            ok: true,
            paymentId: payment.id,
            invoiceStatus: nextStatus,
            paidAmount: paidAfter,
            balanceDue: Math.max(invoiceTotal - paidAfter, 0),
        });
    } catch (error: any) {
        console.error("record-payment failed", error);
        return res.status(500).json({
            error: error?.message || "Could not record payment.",
        });
    }
}