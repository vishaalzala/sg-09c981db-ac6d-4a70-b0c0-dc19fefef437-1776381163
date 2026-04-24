import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { WofPortalLayout } from "@/components/wof/WofPortalLayout";
import { Button } from "@/components/ui/button";

type ItemStatus = "pass" | "fail" | "na" | null;
type Item = { id: string; label: string; status: ItemStatus; failNote?: string; note?: string; image?: string | null };
type Section = { id: string; title: string; items: Item[] };
const STORAGE_KEY = "wof-process-autosave";

const defaultSections: Section[] = [
    {
        id: "identification", title: "Vehicle Identification", items: [
            { id: "vin", label: "General Vehicle - VIN & Chassis Number", status: null },
            { id: "vehicle_details", label: "General Vehicle - Vehicle Details", status: null },
            { id: "lvv", label: "General Vehicle - LVV", status: null },
        ]
    },
    {
        id: "tyres", title: "Tyres, wheels and hubs", items: [
            { id: "tyre_depth", label: "Tyre tread depth (mm)", status: null },
            { id: "wheels", label: "General Vehicle - Wheels, fixtures", status: null },
            { id: "mudguards", label: "General Vehicle - Mudguards", status: null },
        ]
    },
    {
        id: "brakes", title: "Brakes", items: [
            { id: "service_brake", label: "General Vehicle - Service brake", status: null },
            { id: "parking_brake", label: "General Vehicle - Parking Brake", status: null },
        ]
    },
    {
        id: "lights", title: "Lighting", items: [
            { id: "headlamps", label: "General Vehicle - Headlamps", status: null },
            { id: "indicators", label: "General Vehicle - Direction indicator lamps", status: null },
            { id: "brake_lights", label: "General Vehicle - Stop lamps [Brake Lights]", status: null },
        ]
    },
    {
        id: "vision", title: "Vision", items: [
            { id: "glazing", label: "General Vehicle - Glazing", status: null },
            { id: "mirrors", label: "General Vehicle - Rear View Mirrors", status: null },
        ]
    },
    {
        id: "misc", title: "Miscellaneous Items", items: [
            { id: "engine", label: "General Vehicle - Engine and Transmission", status: null },
            { id: "fuel", label: "General Vehicle - Fuel System", status: null },
        ]
    },
];

function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const maxWidth = 900;
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("No canvas context"));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.72));
            };
            img.onerror = reject;
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function WofProcessPage() {
    const router = useRouter();
    const canvasRef = useRef < HTMLCanvasElement | null > (null);
    const drawingRef = useRef(false);
    const [companyId, setCompanyId] = useState("");
    const [inspectionId, setInspectionId] = useState < string | null > (null);
    const [startPayload, setStartPayload] = useState < any > (null);
    const [sections, setSections] = useState < Section[] > (defaultSections);
    const [generalComments, setGeneralComments] = useState("");
    const [signatureData, setSignatureData] = useState < string > ("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const payload = typeof window !== "undefined" ? sessionStorage.getItem("wof-start-payload") : null;
        const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (payload) setStartPayload(JSON.parse(payload));
        if (saved) {
            const parsed = JSON.parse(saved);
            setSections(parsed.sections || defaultSections);
            setGeneralComments(parsed.generalComments || "");
            setSignatureData(parsed.signatureData || "");
            setInspectionId(parsed.inspectionId || null);
            if (parsed.startPayload) setStartPayload(parsed.startPayload);
        }
        companyService.getCurrentCompany().then(async (company) => {
            setCompanyId(company?.id || "");
            const inspectionIdFromUrl = typeof router.query.id === "string" ? router.query.id : "";
            if (inspectionIdFromUrl) {
                const { data } = await supabase.from("wof_inspections").select(`*, vehicle:vehicles!wof_inspections_vehicle_id_fkey(*), customer:customers!wof_inspections_customer_id_fkey(*)`).eq("id", inspectionIdFromUrl).maybeSingle();
                if (data) {
                    setInspectionId((data as any).id);
                    const checklist = (data as any).checklist || {};
                    setSections((checklist.sections as any) || defaultSections);
                    setGeneralComments(checklist.generalComments || (data as any).notes || "");
                    setSignatureData(checklist.signatureData || "");
                    setStartPayload({
                        rego: (data as any).rego,
                        odometer: (data as any).odometer,
                        vehicle: (data as any).vehicle,
                        customer: (data as any).customer,
                        inspector: { id: (data as any).inspector_id, name: (data as any).inspector_name, number: "WOF Inspector" },
                        recheckOf: (data as any).original_inspection_id || null,
                        isRecheck: !!(data as any).is_recheck,
                    });
                }
            }
        });
    }, [router.query.id]);

    const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
    const checkedCount = flatItems.filter((i) => i.status).length;
    const failCount = flatItems.filter((i) => i.status === "fail").length;
    const percent = flatItems.length ? Math.round((checkedCount / flatItems.length) * 100) : 0;
    const submitLabel = failCount > 0 ? "Fail Inspection" : checkedCount === flatItems.length && flatItems.length > 0 ? "Pass Inspection" : "Submit Inspection";

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ inspectionId, startPayload, sections, generalComments, signatureData }));
        }
    }, [inspectionId, startPayload, sections, generalComments, signatureData]);

    useEffect(() => {
        if (!startPayload || !companyId) return;
        const timer = setTimeout(() => {
            void autoSave(false);
        }, 20000);
        return () => clearTimeout(timer);
    }, [sections, generalComments, signatureData, startPayload, companyId]);

    const autoSave = async (showBusy = false) => {
        if (!startPayload || !companyId) return;
        if (showBusy) setSaving(true);
        try {
            const payload = {
                company_id: companyId,
                customer_id: startPayload.customer?.id || null,
                vehicle_id: startPayload.vehicle?.id,
                rego: startPayload.rego,
                odometer: Number(startPayload.odometer || 0),
                inspector_id: startPayload.inspector?.id,
                inspector_name: startPayload.inspector?.name,
                status: "in_progress",
                inspection_type: startPayload.isRecheck ? "recheck" : "inspection",
                is_recheck: !!startPayload.isRecheck,
                original_inspection_id: startPayload.recheckOf || null,
                checklist: { sections, generalComments, signatureData, vehicle: startPayload.vehicle, customer: startPayload.customer },
                notes: generalComments,
            } as any;
            if (!inspectionId) {
                const { data, error } = await supabase.from("wof_inspections").insert(payload).select("id").single();
                if (error) throw error;
                setInspectionId((data as any).id);
            } else {
                const { error } = await supabase.from("wof_inspections").update(payload).eq("id", inspectionId);
                if (error) throw error;
            }
        } catch (e) {
            console.error("Autosave failed", e);
        } finally {
            if (showBusy) setSaving(false);
        }
    };

    const setItemStatus = (sectionId: string, itemId: string, status: ItemStatus) => {
        setSections((prev) => prev.map((section) => section.id !== sectionId ? section : ({
            ...section,
            items: section.items.map((item) => item.id !== itemId ? item : ({ ...item, status, failNote: status === "fail" ? item.failNote || "" : "" })),
        })));
    };

    const updateItemField = (sectionId: string, itemId: string, field: keyof Item, value: any) => {
        setSections((prev) => prev.map((section) => section.id !== sectionId ? section : ({
            ...section,
            items: section.items.map((item) => item.id !== itemId ? item : ({ ...item, [field]: value })),
        })));
    };

    const handleImage = async (sectionId: string, itemId: string, file?: File) => {
        if (!file) return;
        const compressed = await compressImage(file);
        updateItemField(sectionId, itemId, "image", compressed);
    };

    const startDraw = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawingRef.current = true;
        ctx.beginPath();
        ctx.moveTo(x, y);
    };
    const draw = (x: number, y: number) => {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#0f172a";
        ctx.lineTo(x, y);
        ctx.stroke();
        setSignatureData(canvas.toDataURL("image/png"));
    };
    const endDraw = () => { drawingRef.current = false; };

    const onMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (e.type === "mousedown") startDraw(x, y);
        if (e.type === "mousemove") draw(x, y);
        if (e.type === "mouseup" || e.type === "mouseleave") endDraw();
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData("");
    };

    const submitInspection = async () => {
        if (!signatureData || !canvasRef.current?.toDataURL().includes("base64")) {
            alert("Inspector signature required.");
            return;
        }
        await autoSave(true);
        const finalResult = failCount > 0 ? "fail" : "pass";
        const expiryDate = finalResult === "pass" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;
        const finalChecklist = { sections, generalComments, signatureData, vehicle: startPayload.vehicle, customer: startPayload.customer };
        const { error } = await supabase.from("wof_inspections").update({
            status: "completed",
            overall_result: finalResult,
            expiry_date: expiryDate,
            pass_date: finalResult === "pass" ? new Date().toISOString() : null,
            checklist: finalChecklist,
            notes: generalComments,
            updated_at: new Date().toISOString(),
        } as any).eq("id", inspectionId);
        if (error) {
            alert(error.message);
            return;
        }
        localStorage.removeItem(STORAGE_KEY);
        router.push("/wof/history");
    };

    if (!startPayload) {
        return <WofPortalLayout title="WOF Inspection"><div className="rounded-2xl border border-slate-200 bg-white p-6">No WOF start data found. Please begin from the WOF Home page.</div></WofPortalLayout>;
    }

    return (
        <WofPortalLayout>
            <div className="sticky top-[76px] z-40 mb-4 rounded-[20px] border border-slate-200 bg-[#f9fbfd] p-4 shadow-sm">
                <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[320px_minmax(260px,1fr)_auto_auto]">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-white">☑</div>
                        <div className="min-w-0">
                            <h1 className="text-[22px] font-extrabold leading-tight">WOF Inspection</h1>
                            <div className="truncate text-sm text-slate-500">{startPayload.vehicle?.year} {startPayload.vehicle?.make} {startPayload.vehicle?.model} · {startPayload.customer?.name || "Customer"}</div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-500"><span>{checkedCount} / {flatItems.length} items checked</span><span>{percent}%</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full" style={{ width: `${percent}%`, background: failCount > 0 ? "#e11d48" : checkedCount === flatItems.length ? "#16a34a" : "#1ea0e5" }} /></div>
                    </div>
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-blue-700">{startPayload.rego}</div>
                    <Button onClick={submitInspection} disabled={saving} className={`h-12 rounded-2xl px-6 ${failCount > 0 ? "bg-rose-600 hover:bg-rose-700" : checkedCount === flatItems.length ? "bg-emerald-600 hover:bg-emerald-700" : "bg-sky-600 hover:bg-sky-700"}`}>{saving ? "Saving..." : submitLabel}</Button>
                </div>
            </div>

            <div className="space-y-4">
                {sections.map((section) => (
                    <section key={section.id} className="rounded-[18px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4 text-lg font-bold text-sky-700">{section.title}</div>
                        {section.items.map((item) => (
                            <div key={item.id} className={`border-b border-slate-100 px-6 py-4 last:border-b-0 ${item.status === "pass" ? "bg-emerald-50" : item.status === "fail" ? "bg-rose-50" : item.status === "na" ? "bg-slate-50" : "bg-white"}`}>
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1 text-[17px] font-medium">{item.label}</div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {(["pass", "fail", "na"] as ItemStatus[]).map((value) => (
                                            <button key={value || "none"} onClick={() => setItemStatus(section.id, item.id, value)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${item.status === value ? value === "pass" ? "border-emerald-500 bg-emerald-500 text-white" : value === "fail" ? "border-rose-500 bg-rose-500 text-white" : "border-slate-500 bg-slate-500 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{value === "pass" ? "Pass" : value === "fail" ? "Fail" : "N/A"}</button>
                                        ))}
                                        <label className="cursor-pointer rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-600">📷<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImage(section.id, item.id, e.target.files?.[0])} /></label>
                                    </div>
                                </div>
                                {item.status === "fail" && (
                                    <textarea value={item.failNote || ""} onChange={(e) => updateItemField(section.id, item.id, "failNote", e.target.value)} className="mt-3 min-h-[60px] w-full rounded-xl border border-rose-200 px-3 py-3 text-sm" placeholder="Describe the failed item..." />
                                )}
                                <textarea value={item.note || ""} onChange={(e) => updateItemField(section.id, item.id, "note", e.target.value)} className="mt-3 min-h-[60px] w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm" placeholder="Add note (optional)..." />
                                {item.image && <img src={item.image} alt="inspection" className="mt-3 h-24 w-24 rounded-xl border object-cover" />}
                            </div>
                        ))}
                    </section>
                ))}

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-lg font-bold text-sky-700">Inspector Comments</div>
                    <textarea value={generalComments} onChange={(e) => setGeneralComments(e.target.value)} className="mt-4 min-h-[130px] w-full rounded-2xl border border-slate-200 px-4 py-4" placeholder="Enter inspector comments..." />
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-semibold">Inspector Signature</div>
                            <div className="text-sm text-slate-400">Signature is required before submit.</div>
                        </div>
                        <button onClick={clearSignature} className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">↺ Clear</button>
                    </div>
                    <canvas
                        ref={canvasRef}
                        width={900}
                        height={180}
                        className="w-full rounded-[18px] border border-dashed border-slate-300 bg-slate-50"
                        onMouseDown={onMouse}
                        onMouseMove={onMouse}
                        onMouseUp={onMouse}
                        onMouseLeave={onMouse}
                    />
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="text-slate-500">Inspector: <span className="text-slate-700">{startPayload.inspector?.name} — {startPayload.inspector?.number}</span></div>
                        <div className="text-slate-400">{new Date().toLocaleDateString()}</div>
                    </div>
                </section>
            </div>
        </WofPortalLayout>
    );
}
