import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type CheckInRequestBody = {
    companyId?: string;
    name?: string;
    mobile?: string;
    phone?: string | null;
    email?: string | null;
    rego?: string;
    service?: string;
    issue?: string | null;
    pickupTime?: string | null;
    approvalLimit?: number | null;
};

function normalizePhone(value?: string | null) {
    return (value || "").replace(/\s+/g, "").trim();
}

function normalizeRego(value?: string | null) {
    return (value || "").replace(/\s+/g, "").trim().toUpperCase();
}

function makeJobNumber() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CHK-${yyyy}-${random}`;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body as CheckInRequestBody;

    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const mobile = normalizePhone(body.mobile);
    const phone = normalizePhone(body.phone);
    const email = typeof body.email === "string" ? body.email.trim() : null;
    const rego = normalizeRego(body.rego);
    const service = typeof body.service === "string" ? body.service.trim() : "";
    const issue = typeof body.issue === "string" ? body.issue.trim() : null;
    const pickupTime =
        typeof body.pickupTime === "string" && body.pickupTime
            ? body.pickupTime
            : null;
    const approvalLimit =
        typeof body.approvalLimit === "number" && !Number.isNaN(body.approvalLimit)
            ? body.approvalLimit
            : null;

    if (!companyId) {
        return res.status(400).json({ error: "Missing companyId" });
    }

    if (!name || !mobile || !rego || !service) {
        return res.status(400).json({
            error: "Name, mobile, registration number, and service are required.",
        });
    }

    try {
        const admin = getSupabaseAdmin();

        const { data: company, error: companyError } = await admin
            .from("companies")
            .select("id, name")
            .eq("id", companyId)
            .maybeSingle();

        if (companyError) throw companyError;

        if (!company) {
            return res.status(404).json({ error: "Workshop not found." });
        }

        const { data: existingCustomer, error: customerLookupError } = await admin
            .from("customers")
            .select("id, name, mobile, phone, email")
            .eq("company_id", companyId)
            .is("deleted_at", null)
            .or(`mobile.eq.${mobile},phone.eq.${mobile}`)
            .maybeSingle();

        if (customerLookupError) throw customerLookupError;

        let customerId = existingCustomer?.id;

        if (customerId) {
            const { error: updateCustomerError } = await admin
                .from("customers")
                .update({
                    name,
                    mobile,
                    phone: phone || existingCustomer.phone || null,
                    email: email || existingCustomer.email || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", customerId)
                .eq("company_id", companyId);

            if (updateCustomerError) throw updateCustomerError;
        } else {
            const { data: newCustomer, error: createCustomerError } = await admin
                .from("customers")
                .insert({
                    company_id: companyId,
                    name,
                    mobile,
                    phone: phone || null,
                    email,
                    source_of_business: "Kiosk Check-In",
                    notes: "Created from public vehicle check-in kiosk.",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select("id")
                .single();

            if (createCustomerError) throw createCustomerError;
            customerId = newCustomer.id;
        }

        const { data: existingVehicle, error: vehicleLookupError } = await admin
            .from("vehicles")
            .select("id, customer_id")
            .eq("company_id", companyId)
            .eq("registration_number", rego)
            .is("deleted_at", null)
            .maybeSingle();

        if (vehicleLookupError) throw vehicleLookupError;

        let vehicleId = existingVehicle?.id;

        if (vehicleId) {
            const { error: updateVehicleError } = await admin
                .from("vehicles")
                .update({
                    customer_id: customerId,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", vehicleId)
                .eq("company_id", companyId);

            if (updateVehicleError) throw updateVehicleError;
        } else {
            const { data: newVehicle, error: createVehicleError } = await admin
                .from("vehicles")
                .insert({
                    company_id: companyId,
                    customer_id: customerId,
                    registration_number: rego,
                    notes: "Created from public vehicle check-in kiosk.",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select("id")
                .single();

            if (createVehicleError) throw createVehicleError;
            vehicleId = newVehicle.id;
        }

        const jobNumber = makeJobNumber();

        const descriptionParts = [
            `Service required: ${service}`,
            issue ? `Customer issue: ${issue}` : null,
            pickupTime ? `Requested pickup time: ${pickupTime}` : null,
            approvalLimit !== null ? `Approval limit: $${approvalLimit}` : null,
        ].filter(Boolean);

        const { data: newJob, error: createJobError } = await admin
            .from("jobs")
            .insert({
                company_id: companyId,
                customer_id: customerId,
                vehicle_id: vehicleId,
                job_number: jobNumber,
                job_title: service,
                description: descriptionParts.join("\n"),
                customer_notes: issue,
                pickup_time: pickupTime,
                status: "pending",
                priority: "normal",
                source_of_business: "Kiosk Check-In",
                notes:
                    approvalLimit !== null
                        ? `Customer approval limit: $${approvalLimit}`
                        : null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select("id, job_number")
            .single();

        if (createJobError) throw createJobError;

        return res.status(200).json({
            ok: true,
            companyId,
            customerId,
            vehicleId,
            jobId: newJob.id,
            jobNumber: newJob.job_number || jobNumber,
        });
    } catch (error: any) {
        console.error("checkin/create failed", error);
        return res.status(500).json({
            error: error?.message || "Could not complete check-in.",
        });
    }
}