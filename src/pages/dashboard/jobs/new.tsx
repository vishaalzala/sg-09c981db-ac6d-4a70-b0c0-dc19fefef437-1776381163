import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { jobService } from "@/services/jobService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MatchResult {
    id: string;
    name: string;
    email?: string | null;
    mobile?: string | null;
    phone?: string | null;
    vehicles?: any[];
}

export default function NewJobPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [staff, setStaff] = useState < any[] > ([]);
    const [jobTypes, setJobTypes] = useState < any[] > ([]);
    const [tags, setTags] = useState < any[] > ([]);
    const [businessSources, setBusinessSources] = useState < string[] > ([]);
    const [matchingResults, setMatchingResults] = useState < MatchResult[] > ([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState < string | null > (null);
    const [selectedVehicleId, setSelectedVehicleId] = useState < string | null > (null);

    const [form, setForm] = useState({
        ownerName: "",
        ownerMobile: "",
        ownerPhone: "",
        ownerEmail: "",
        sourceOfBusiness: "",
        postalAddress: "",
        suburb: "",
        city: "",
        postcode: "",
        isCompany: false,

        registrationNumber: "",
        make: "",
        model: "",
        year: "",
        bodyType: "",

        invoiceToThirdParty: "",
        shortDescription: "",
        note: "",
        startDate: new Date().toISOString().split("T")[0],
        startTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
        estimatedFinishDate: "",
        estimatedFinishTime: "",
        pickupDate: new Date().toISOString().split("T")[0],
        pickupTime: "17:00",
        estimatedWorkHours: "",
        orderNumber: "",
        odometer: "",
        courtesyVehicle: false,
    });

    const [selectedJobTypeIds, setSelectedJobTypeIds] = useState < string[] > ([]);
    const [selectedMechanicIds, setSelectedMechanicIds] = useState < string[] > ([]);
    const [selectedTagIds, setSelectedTagIds] = useState < string[] > ([]);

    useEffect(() => {
        void bootstrap();
    }, []);

    useEffect(() => {
        if (!companyId) return;
        const t = setTimeout(() => {
            void runAutoSearch();
        }, 250);
        return () => clearTimeout(t);
    }, [companyId, form.ownerName, form.ownerMobile, form.ownerPhone, form.registrationNumber, form.invoiceToThirdParty]);

    const bootstrap = async () => {
        setLoading(true);
        const company = await companyService.getCurrentCompany();
        if (!company) {
            setLoading(false);
            return;
        }
        setCompanyId(company.id);

        const [staffRes, jobTypeRes, tagRes] = await Promise.all([
            supabase.from("users").select("id, full_name, email").eq("company_id", company.id).order("full_name"),
            supabase.from("job_types").select("id, name, description, estimated_hours").eq("company_id", company.id).order("name"),
            supabase.from("tags").select("id, name, color").eq("company_id", company.id).order("name"),
        ]);

        setStaff(staffRes.data || []);
        setJobTypes(jobTypeRes.data || []);
        setTags(tagRes.data || []);
        setBusinessSources(["Walk In", "Repeat Customer", "Phone", "Website", "Referral"]);
        setLoading(false);
    };

    const runAutoSearch = async () => {
        if (!form.ownerName && !form.ownerMobile && !form.ownerPhone && !form.registrationNumber && !form.invoiceToThirdParty) {
            setMatchingResults([]);
            return;
        }

        const customerMatches: MatchResult[] = [];
        let query = supabase.from("customers").select("id,name,email,mobile,phone,vehicles(*)").eq("company_id", companyId);
        if (form.ownerName) query = query.ilike("name", `%${form.ownerName}%`);
        if (form.ownerMobile) query = query.ilike("mobile", `%${form.ownerMobile}%`);
        if (form.ownerPhone) query = query.ilike("phone", `%${form.ownerPhone}%`);
        if (form.invoiceToThirdParty) query = query.ilike("bill_to_third_party", `%${form.invoiceToThirdParty}%`);
        const { data: customerData } = await query.limit(5);
        if (customerData) customerMatches.push(...(customerData as any[]));

        const vehicleMatches: MatchResult[] = [];
        if (form.registrationNumber) {
            const { data: vehicleData } = await supabase
                .from("vehicles")
                .select("id,registration_number,make,model,year,customer:customers(id,name,email,mobile,phone)")
                .eq("company_id", companyId)
                .ilike("registration_number", `%${form.registrationNumber}%`)
                .limit(5);

            for (const vehicle of vehicleData || []) {
                const customer = Array.isArray((vehicle as any).customer) ? (vehicle as any).customer[0] : (vehicle as any).customer;
                if (!customer) continue;
                vehicleMatches.push({
                    ...customer,
                    vehicles: [{
                        id: (vehicle as any).id,
                        registration_number: (vehicle as any).registration_number,
                        make: (vehicle as any).make,
                        model: (vehicle as any).model,
                        year: (vehicle as any).year,
                    }],
                });
            }
        }

        const combined = [...customerMatches, ...vehicleMatches];
        const deduped = Array.from(new Map(combined.map((item) => [item.id, item])).values());
        setMatchingResults(deduped.slice(0, 6));
    };

    const selectMatch = async (result: MatchResult) => {
        setSelectedCustomerId(result.id);
        setForm((prev) => ({
            ...prev,
            ownerName: result.name || "",
            ownerEmail: result.email || "",
            ownerMobile: result.mobile || "",
            ownerPhone: result.phone || "",
        }));

        if (result.vehicles?.length) {
            const vehicle = result.vehicles[0];
            setSelectedVehicleId(vehicle.id);
            setForm((prev) => ({
                ...prev,
                registrationNumber: vehicle.registration_number || "",
                make: vehicle.make || "",
                model: vehicle.model || "",
                year: vehicle.year ? String(vehicle.year) : "",
            }));
        }
    };

    const combinedStart = useMemo(() => `${form.startDate}T${form.startTime || "09:00"}:00`, [form.startDate, form.startTime]);
    const combinedPickup = useMemo(() => `${form.pickupDate}T${form.pickupTime || "17:00"}:00`, [form.pickupDate, form.pickupTime]);
    const combinedEstimatedFinish = useMemo(() => {
        if (!form.estimatedFinishDate) return null;
        return `${form.estimatedFinishDate}T${form.estimatedFinishTime || "17:00"}:00`;
    }, [form.estimatedFinishDate, form.estimatedFinishTime]);

    const handleSave = async () => {
        if (!companyId) return;
        if (!form.ownerName.trim()) {
            toast({ title: "Customer required", description: "Please enter the vehicle owner name.", variant: "destructive" });
            return;
        }
        if (!form.shortDescription.trim()) {
            toast({ title: "Short description required", description: "Add the main job description before saving.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            let customerId = selectedCustomerId;
            let vehicleId = selectedVehicleId;

            if (!customerId) {
                const { data: customer, error: customerError } = await supabase
                    .from("customers")
                    .insert({
                        company_id: companyId,
                        name: form.ownerName,
                        email: form.ownerEmail || null,
                        mobile: form.ownerMobile || null,
                        phone: form.ownerPhone || null,
                        postal_address: [form.postalAddress, form.suburb, form.city, form.postcode].filter(Boolean).join(", "),
                        source_of_business: form.sourceOfBusiness || null,
                        bill_to_third_party: form.invoiceToThirdParty || null,
                        is_company: form.isCompany,
                    } as any)
                    .select()
                    .single();
                if (customerError) throw customerError;
                customerId = customer.id;
            }

            if (!vehicleId && form.registrationNumber.trim()) {
                const { data: vehicle, error: vehicleError } = await supabase
                    .from("vehicles")
                    .insert({
                        company_id: companyId,
                        customer_id: customerId,
                        registration_number: form.registrationNumber,
                        make: form.make || null,
                        model: form.model || null,
                        year: form.year ? parseInt(form.year, 10) : null,
                        body_type: form.bodyType || null,
                        odometer: form.odometer ? parseInt(form.odometer, 10) : null,
                    } as any)
                    .select()
                    .single();
                if (vehicleError) throw vehicleError;
                vehicleId = vehicle.id;
            }

            const jobNumber = await jobService.generateJobNumber(companyId);
            const jobTitle = form.shortDescription.trim();
            const { data: job, error: jobError } = await supabase
                .from("jobs")
                .insert({
                    company_id: companyId,
                    customer_id: customerId,
                    vehicle_id: vehicleId,
                    job_number: jobNumber,
                    job_title: jobTitle,
                    description: form.shortDescription,
                    internal_notes: form.note || null,
                    source_of_business: form.sourceOfBusiness || null,
                    start_time: new Date(combinedStart).toISOString(),
                    estimated_finish_time: combinedEstimatedFinish ? new Date(combinedEstimatedFinish).toISOString() : null,
                    pickup_time: new Date(combinedPickup).toISOString(),
                    estimated_work_hours: form.estimatedWorkHours ? parseFloat(form.estimatedWorkHours) : null,
                    order_number: form.orderNumber || null,
                    odometer: form.odometer ? parseInt(form.odometer, 10) : null,
                    courtesy_vehicle_id: form.courtesyVehicle ? vehicleId || null : null,
                    invoice_to_third_party: !!form.invoiceToThirdParty,
                    third_party_name: form.invoiceToThirdParty || null,
                    status: "booked",
                } as any)
                .select()
                .single();
            if (jobError) throw jobError;

            if (selectedMechanicIds.length > 0) {
                const rows = selectedMechanicIds.map((userId) => ({ job_id: job.id, user_id: userId }));
                const { error } = await supabase.from("job_mechanics").insert(rows as any);
                if (error) throw error;
            }

            if (selectedJobTypeIds.length > 0) {
                const rows = selectedJobTypeIds.map((job_type_id) => ({ job_id: job.id, job_type_id }));
                const { error } = await supabase.from("job_job_types").insert(rows as any);
                if (error) throw error;
            }

            if (selectedTagIds.length > 0) {
                const rows = selectedTagIds.map((tag_id) => ({ job_id: job.id, tag_id }));
                const { error } = await supabase.from("job_tags").insert(rows as any);
                if (error) throw error;
            }

            // Add a starter work line so the job checksheet is never empty.
            const { error: lineError } = await supabase.from("job_line_items").insert({
                job_id: job.id,
                description: form.shortDescription,
                quantity: 1,
                unit_price: 0,
                line_total: 0,
                line_type: "header",
                sort_order: 0,
                notes: form.note || null,
            } as any);
            if (lineError) throw lineError;

            toast({ title: "Job created", description: "The job card is ready for the workshop." });
            router.push(`/dashboard/jobs/${job.id}`);
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message || "Failed to create job", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout companyId={companyId}>
            <div className="mx-auto w-full max-w-[1600px] space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Job</h1>
                        <p className="mt-1 text-sm text-slate-500">Create the workshop job card first, then turn it into an invoice later.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push("/dashboard/jobs")}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || loading}>{saving ? "Saving..." : "Create Job"}</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_380px]">
                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <CardContent className="p-6 space-y-8">
                            <section>
                                <h2 className="mb-4 text-xl font-bold text-slate-900">Vehicle Owner</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Name</Label>
                                        <Input value={form.ownerName} onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))} />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <Label>Email</Label>
                                            <Input value={form.ownerEmail} onChange={(e) => setForm((p) => ({ ...p, ownerEmail: e.target.value }))} />
                                        </div>
                                        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                                            <Checkbox checked={form.isCompany} onCheckedChange={(checked) => setForm((p) => ({ ...p, isCompany: !!checked }))} />
                                            <span className="text-sm">Is company</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Mobile</Label>
                                        <Input value={form.ownerMobile} onChange={(e) => setForm((p) => ({ ...p, ownerMobile: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <Input value={form.ownerPhone} onChange={(e) => setForm((p) => ({ ...p, ownerPhone: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Source of Business</Label>
                                        <Select value={form.sourceOfBusiness} onValueChange={(value) => setForm((p) => ({ ...p, sourceOfBusiness: value }))}>
                                            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                                            <SelectContent>
                                                {businessSources.map((source) => <SelectItem key={source} value={source}>{source}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Postal Address</Label>
                                        <Input value={form.postalAddress} onChange={(e) => setForm((p) => ({ ...p, postalAddress: e.target.value }))} placeholder="Enter a location" />
                                    </div>
                                    <div>
                                        <Label>Suburb</Label>
                                        <Input value={form.suburb} onChange={(e) => setForm((p) => ({ ...p, suburb: e.target.value }))} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>State/City</Label>
                                            <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                                        </div>
                                        <div>
                                            <Label>Postcode</Label>
                                            <Input value={form.postcode} onChange={(e) => setForm((p) => ({ ...p, postcode: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="mb-4 text-xl font-bold text-slate-900">Vehicle</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Registration Number</Label>
                                        <Input value={form.registrationNumber} onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value.toUpperCase() }))} />
                                    </div>
                                    <div>
                                        <Label>Make</Label>
                                        <Input value={form.make} onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Model</Label>
                                        <Input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Year</Label>
                                        <Input value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Body Type</Label>
                                        <Input value={form.bodyType} onChange={(e) => setForm((p) => ({ ...p, bodyType: e.target.value }))} />
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="mb-4 text-xl font-bold text-slate-900">Job</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label>Invoice to 3rd Party</Label>
                                        <Input value={form.invoiceToThirdParty} onChange={(e) => setForm((p) => ({ ...p, invoiceToThirdParty: e.target.value }))} placeholder="Optional" />
                                    </div>
                                    <div>
                                        <Label>Order Number</Label>
                                        <Input value={form.orderNumber} onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value }))} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Short Description</Label>
                                        <Textarea rows={3} value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Note / More Details</Label>
                                        <Textarea rows={4} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                                    </div>

                                    <div>
                                        <Label>Job Types</Label>
                                        <Select onValueChange={(value) => setSelectedJobTypeIds((prev) => prev.includes(value) ? prev : [...prev, value])}>
                                            <SelectTrigger><SelectValue placeholder="Pick job types..." /></SelectTrigger>
                                            <SelectContent>
                                                {jobTypes.map((jt) => <SelectItem key={jt.id} value={jt.id}>{jt.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {selectedJobTypeIds.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedJobTypeIds.map((id) => {
                                                    const jt = jobTypes.find((x) => x.id === id);
                                                    return <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setSelectedJobTypeIds((prev) => prev.filter((x) => x !== id))}>{jt?.name || id}</Badge>;
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Mechanics</Label>
                                        <Select onValueChange={(value) => setSelectedMechanicIds((prev) => prev.includes(value) ? prev : [...prev, value])}>
                                            <SelectTrigger><SelectValue placeholder="Assign mechanics..." /></SelectTrigger>
                                            <SelectContent>
                                                {staff.map((member) => <SelectItem key={member.id} value={member.id}>{member.full_name || member.email}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {selectedMechanicIds.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedMechanicIds.map((id) => {
                                                    const member = staff.find((x) => x.id === id);
                                                    return <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setSelectedMechanicIds((prev) => prev.filter((x) => x !== id))}>{member?.full_name || member?.email || id}</Badge>;
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Start Date</Label>
                                            <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
                                        </div>
                                        <div>
                                            <Label>Start Time</Label>
                                            <Input type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Estimated Finish Date</Label>
                                            <Input type="date" value={form.estimatedFinishDate} onChange={(e) => setForm((p) => ({ ...p, estimatedFinishDate: e.target.value }))} />
                                        </div>
                                        <div>
                                            <Label>Estimated Finish Time</Label>
                                            <Input type="time" value={form.estimatedFinishTime} onChange={(e) => setForm((p) => ({ ...p, estimatedFinishTime: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Pickup Date</Label>
                                            <Input type="date" value={form.pickupDate} onChange={(e) => setForm((p) => ({ ...p, pickupDate: e.target.value }))} />
                                        </div>
                                        <div>
                                            <Label>Pickup Time</Label>
                                            <Input type="time" value={form.pickupTime} onChange={(e) => setForm((p) => ({ ...p, pickupTime: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Estimated Work Hours</Label>
                                        <Input value={form.estimatedWorkHours} onChange={(e) => setForm((p) => ({ ...p, estimatedWorkHours: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Odometer</Label>
                                        <Input value={form.odometer} onChange={(e) => setForm((p) => ({ ...p, odometer: e.target.value }))} />
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-3">
                                        <Checkbox checked={form.courtesyVehicle} onCheckedChange={(checked) => setForm((p) => ({ ...p, courtesyVehicle: !!checked }))} />
                                        <span className="text-sm">Courtesy Vehicle</span>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Tags</Label>
                                        <Select onValueChange={(value) => setSelectedTagIds((prev) => prev.includes(value) ? prev : [...prev, value])}>
                                            <SelectTrigger><SelectValue placeholder="Add tags..." /></SelectTrigger>
                                            <SelectContent>
                                                {tags.map((tag) => <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {selectedTagIds.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedTagIds.map((id) => {
                                                    const tag = tags.find((x) => x.id === id);
                                                    return <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => setSelectedTagIds((prev) => prev.filter((x) => x !== id))}>{tag?.name || id}</Badge>;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-20 xl:self-start">
                        <CardHeader>
                            <CardTitle>Search Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {matchingResults.length === 0 && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                                    No exact match found. Saving will create a new customer/vehicle from the details on the left.
                                </div>
                            )}
                            {matchingResults.map((result) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    className={cn(
                                        "w-full rounded-lg border p-3 text-left transition-colors",
                                        selectedCustomerId === result.id ? "border-orange-500 bg-orange-50" : "hover:bg-slate-50"
                                    )}
                                    onClick={() => void selectMatch(result)}
                                >
                                    <div className="font-semibold">{result.name}</div>
                                    <div className="mt-1 text-xs text-slate-500">{[result.mobile, result.email].filter(Boolean).join(" · ")}</div>
                                    {result.vehicles?.[0] && (
                                        <div className="mt-2 text-xs text-slate-700">
                                            Vehicle: {result.vehicles[0].registration_number} · {result.vehicles[0].make} {result.vehicles[0].model}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
