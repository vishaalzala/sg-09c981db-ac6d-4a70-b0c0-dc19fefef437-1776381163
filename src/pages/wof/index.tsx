import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { WofPortalLayout } from "@/components/wof/WofPortalLayout";
import { Button } from "@/components/ui/button";

export default function WofStartPage() {
    const router = useRouter();
    const [companyId, setCompanyId] = useState("");
    const [rego, setRego] = useState("");
    const [odometer, setOdometer] = useState("");
    const [loading, setLoading] = useState(false);
    const [vehicle, setVehicle] = useState < any > (null);
    const [customer, setCustomer] = useState < any > (null);
    const [inspector, setInspector] = useState < { id: string; name: string; number: string } | null > (null);
    const [buttonLabel, setButtonLabel] = useState("Process");
    const [latestInspection, setLatestInspection] = useState < any > (null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            const company = await companyService.getCurrentCompany();
            if (company) setCompanyId(company.id);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
            const { data: inspectorProfile } = await supabase.from("inspector_certifications").select("certification_number").eq("inspector_id", user.id).maybeSingle();
            setInspector({
                id: user.id,
                name: (profile as any)?.full_name || user.email || "WOF Inspector",
                number: (inspectorProfile as any)?.certification_number || "WOF Inspector",
            });
        })();
    }, []);

    const vehicleDisplay = useMemo(() => {
        if (!vehicle) return "🚗 Vehicle details will appear here";
        return `${vehicle.year || ""} ${vehicle.make || ""} ${vehicle.model || ""} · VIN ${vehicle.vin || "N/A"}`.trim();
    }, [vehicle]);

    const handleFetch = async () => {
        setLoading(true);
        setError("");
        setVehicle(null);
        setCustomer(null);
        setLatestInspection(null);
        setButtonLabel("Process");
        try {
            if (!companyId) throw new Error("No company found for current user.");
            if (!rego.trim()) throw new Error("Please enter a rego.");
            const regoValue = rego.trim().toUpperCase();
            const { data: vehicleRow, error: vehicleError } = await supabase
                .from("vehicles")
                .select("*")
                .eq("company_id", companyId)
                .ilike("registration_number", regoValue)
                .maybeSingle();
            if (vehicleError) throw vehicleError;
            if (!vehicleRow) throw new Error("Vehicle not found in this company database.");
            setVehicle(vehicleRow);
            if (vehicleRow.customer_id) {
                const { data: customerRow } = await supabase.from("customers").select("*").eq("id", vehicleRow.customer_id).maybeSingle();
                setCustomer(customerRow || null);
            }
            const { data: latest } = await supabase
                .from("wof_inspections")
                .select("*")
                .eq("company_id", companyId)
                .eq("vehicle_id", vehicleRow.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            if (latest) {
                setLatestInspection(latest);
                const inspectionDate = new Date((latest as any).inspection_date || (latest as any).created_at);
                const ageDays = Math.floor((Date.now() - inspectionDate.getTime()) / (1000 * 60 * 60 * 24));
                if ((latest as any).overall_result !== "pass" && ageDays <= 28) {
                    setButtonLabel("Recheck");
                }
            }
        } catch (e: any) {
            setError(e.message || "Failed to fetch vehicle details.");
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = () => {
        if (!vehicle || !inspector) return;
        const payload = {
            rego: rego.trim().toUpperCase(),
            odometer,
            vehicle,
            customer,
            inspector,
            recheckOf: latestInspection?.id || null,
            isRecheck: buttonLabel === "Recheck",
        };
        if (typeof window !== "undefined") {
            sessionStorage.setItem("wof-start-payload", JSON.stringify(payload));
        }
        router.push("/wof/process");
    };

    return (
        <WofPortalLayout title="New WOF Inspection" subtitle="Enter rego to auto-fetch vehicle and customer details, then start the WOF process.">
            <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-[24px] font-bold">WOF Start Page</h2>
                        <p className="text-slate-500 mt-1">Reception creates the customer and vehicle first. Inspectors fetch that data here by rego.</p>
                    </div>
                    <button className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600">Own Company Database</button>
                </div>

                <div className="mt-8">
                    <label className="mb-2 block text-[15px] font-semibold">Rego *</label>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
                        <input className="h-[46px] w-full rounded-[14px] border border-slate-300 px-4" value={rego} onChange={(e) => setRego(e.target.value.toUpperCase())} placeholder="Enter rego e.g. LAZ204" />
                        <Button onClick={handleFetch} disabled={loading} className="h-[46px] rounded-[14px] bg-slate-100 px-7 text-slate-700 hover:bg-slate-200">
                            {loading ? "Fetching..." : "Fetch"}
                        </Button>
                    </div>
                    {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-[15px] font-semibold">Vehicle</label>
                        <div className="flex h-[46px] items-center rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">{vehicleDisplay}</div>
                    </div>
                    <div>
                        <label className="mb-2 block text-[15px] font-semibold">Customer</label>
                        <div className="flex h-[46px] items-center rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">{customer?.name || "👤 Customer name will appear here"}</div>
                    </div>
                    <div>
                        <label className="mb-2 block text-[15px] font-semibold">WOF Inspector</label>
                        <div className="flex h-[46px] items-center rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">{inspector ? `${inspector.name} · ${inspector.number}` : "👤 Auto-fetch logged-in inspector"}</div>
                    </div>
                    <div>
                        <label className="mb-2 block text-[15px] font-semibold">Odometer (km)</label>
                        <input className="h-[46px] w-full rounded-[14px] border border-slate-300 px-4" type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="Enter odometer reading" />
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Button onClick={handleProcess} disabled={!vehicle || !odometer || !inspector} className="h-[46px] rounded-[14px] px-10 bg-blue-600 hover:bg-blue-700">
                        {buttonLabel}
                    </Button>
                </div>
            </section>
        </WofPortalLayout>
    );
}
