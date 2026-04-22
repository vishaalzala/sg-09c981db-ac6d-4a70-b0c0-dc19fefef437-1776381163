import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Slash,
    FileText,
    Image as ImageIcon,
    Video,
    Search,
    CarFront,
    UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

type InspectionStatus = "pass" | "fail" | "n/a" | null;

interface InspectionItem {
    id: string;
    label: string;
    status: InspectionStatus;
    failureDescription?: string;
}

interface InspectionSection {
    id: string;
    title: string;
    expanded: boolean;
    items: InspectionItem[];
}

export default function NewWOF() {
    const router = useRouter();
    const { toast } = useToast();

    const [companyId, setCompanyId] = useState < string > ("");
    const [isLookingUpRego, setIsLookingUpRego] = useState(false);
    const [regoLookupMessage, setRegoLookupMessage] = useState("");
    const [regoLookupError, setRegoLookupError] = useState(false);
    const [vehicleId, setVehicleId] = useState < string | null > (null);

    const [formData, setFormData] = useState({
        vehicle: "",
        reg_number: "",
        customer: "",
        inspector: "",
        odometer: "",
        general_notes: "",
    });

    const initialSections: InspectionSection[] = [
        {
            id: "tyres",
            title: "Tyres & Wheels",
            expanded: true,
            items: [
                { id: "tyre_depth", label: "Tyre tread depth (min 1.5mm)", status: null },
                { id: "tyre_condition", label: "Tyre condition (no cuts, bulges, damage)", status: null },
                { id: "tyre_pressure", label: "Tyre pressure within spec", status: null },
                { id: "spare_tyre", label: "Spare tyre condition (if fitted)", status: null },
                { id: "wheel_nuts", label: "Wheel nuts secure", status: null },
                { id: "wheel_rim", label: "Wheel rim condition", status: null },
            ],
        },
        {
            id: "brakes",
            title: "Brakes",
            expanded: false,
            items: [
                { id: "brake_pads", label: "Brake pad thickness adequate", status: null },
                { id: "brake_discs", label: "Brake discs / drums condition", status: null },
                { id: "brake_lines", label: "Brake lines — no leaks or damage", status: null },
                { id: "handbrake", label: "Handbrake operation", status: null },
                { id: "brake_fluid", label: "Brake fluid level", status: null },
            ],
        },
        {
            id: "lights",
            title: "Lights",
            expanded: false,
            items: [
                { id: "headlights", label: "Headlights — both working", status: null },
                { id: "headlight_aim", label: "Headlight aim correct", status: null },
                { id: "taillights", label: "Tail lights working", status: null },
                { id: "brake_lights", label: "Brake lights working", status: null },
                { id: "indicators", label: "Indicators front & rear", status: null },
                { id: "number_plate", label: "Number plate light", status: null },
                { id: "hazard_lights", label: "Hazard lights", status: null },
            ],
        },
        {
            id: "glazing_mirrors",
            title: "Glazing & Mirrors",
            expanded: false,
            items: [
                { id: "windscreen", label: "Windscreen — no cracks in driver view", status: null },
                { id: "wipers", label: "Windscreen wipers working", status: null },
                { id: "washer", label: "Washer fluid & jets working", status: null },
                { id: "driver_mirror", label: "Driver side mirror secure", status: null },
                { id: "rear_mirror", label: "Rear view mirror secure", status: null },
            ],
        },
        {
            id: "steering_suspension",
            title: "Steering & Suspension",
            expanded: false,
            items: [
                { id: "steering_play", label: "Steering play within limits", status: null },
                { id: "tie_rods", label: "Tie rod ends — no excess wear", status: null },
                { id: "ball_joints", label: "Ball joints — no excess wear", status: null },
                { id: "shock_absorbers", label: "Shock absorbers — no leaks", status: null },
                { id: "wheel_alignment", label: "Wheel alignment acceptable", status: null },
            ],
        },
        {
            id: "body",
            title: "Body & Structure",
            expanded: false,
            items: [
                { id: "body_panels", label: "Body panels — no sharp edges", status: null },
                { id: "structural_rust", label: "Structural corrosion / rust", status: null },
                { id: "doors", label: "Doors open/close/latch properly", status: null },
                { id: "bonnet_latch", label: "Bonnet latch secure", status: null },
            ],
        },
        {
            id: "seatbelts",
            title: "Seatbelts & Occupant Protection",
            expanded: false,
            items: [
                { id: "driver_seatbelt", label: "Driver seatbelt — latches & retracts", status: null },
                { id: "passenger_seatbelts", label: "Passenger seatbelts", status: null },
                { id: "seatbelt_condition", label: "Seatbelt condition — no fraying", status: null },
                { id: "airbag_warning", label: "Airbag warning lights (if equipped)", status: null },
            ],
        },
        {
            id: "engine",
            title: "Engine & Fuel System",
            expanded: false,
            items: [
                { id: "fuel_system", label: "Fuel system — no leaks", status: null },
                { id: "engine_mounts", label: "Engine mounts secure", status: null },
                { id: "exhaust_system", label: "Exhaust system — no leaks, secure", status: null },
                { id: "oil_level", label: "Oil level adequate", status: null },
            ],
        },
    ];

    const [sections, setSections] = useState < InspectionSection[] > (initialSections);

    useEffect(() => {
        companyService.getCurrentCompany().then((c) => {
            if (c) setCompanyId(c.id);
        });
    }, []);

    const normaliseRego = (rego: string) => rego.replace(/\s+/g, "").toUpperCase().trim();

    const lookupVehicleByRego = async (regoInput: string) => {
        const cleanRego = normaliseRego(regoInput);

        setFormData((prev) => ({
            ...prev,
            reg_number: cleanRego,
        }));

        if (!cleanRego || !companyId) {
            setVehicleId(null);
            setFormData((prev) => ({
                ...prev,
                vehicle: "",
                customer: "",
            }));
            setRegoLookupMessage("");
            setRegoLookupError(false);
            return;
        }

        setIsLookingUpRego(true);
        setRegoLookupMessage("");
        setRegoLookupError(false);

        try {
            const { data: vehicle, error: vehicleError } = await supabase
                .from("vehicles")
                .select("*")
                .eq("company_id", companyId)
                .ilike("rego", cleanRego)
                .maybeSingle();

            if (vehicleError) {
                console.error("Vehicle lookup error:", vehicleError);
                throw vehicleError;
            }

            if (!vehicle) {
                setVehicleId(null);
                setFormData((prev) => ({
                    ...prev,
                    vehicle: "",
                    customer: "",
                }));
                setRegoLookupMessage("No vehicle found for this rego in your database.");
                setRegoLookupError(true);
                return;
            }

            const vehicleLabel = [
                vehicle.year,
                vehicle.make,
                vehicle.model,
                vehicle.vin ? `VIN: ${vehicle.vin}` : null,
            ]
                .filter(Boolean)
                .join(" ");

            let customerName = "";

            if (vehicle.customer_id) {
                const { data: customer, error: customerError } = await supabase
                    .from("customers")
                    .select("*")
                    .eq("id", vehicle.customer_id)
                    .maybeSingle();

                if (customerError) {
                    console.error("Customer lookup error:", customerError);
                }

                if (customer) {
                    customerName =
                        customer.name ||
                        customer.full_name ||
                        [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
                        customer.company_name ||
                        "";
                }
            }

            setVehicleId(vehicle.id);
            setFormData((prev) => ({
                ...prev,
                vehicle: vehicleLabel,
                customer: customerName,
                odometer: prev.odometer || (vehicle.odometer ? String(vehicle.odometer) : ""),
            }));

            setRegoLookupMessage("Vehicle found successfully.");
            setRegoLookupError(false);
        } catch (error) {
            console.error("Rego lookup failed:", error);
            setVehicleId(null);
            setFormData((prev) => ({
                ...prev,
                vehicle: "",
                customer: "",
            }));
            setRegoLookupMessage("Could not fetch vehicle details. Please try again.");
            setRegoLookupError(true);
        } finally {
            setIsLookingUpRego(false);
        }
    };

    const toggleSection = (sectionId: string) => {
        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, expanded: !s.expanded } : s))
        );
    };

    const updateItemStatus = (sectionId: string, itemId: string, status: InspectionStatus) => {
        setSections((prev) =>
            prev.map((section) => {
                if (section.id !== sectionId) return section;

                return {
                    ...section,
                    items: section.items.map((item) =>
                        item.id === itemId
                            ? {
                                ...item,
                                status,
                                failureDescription:
                                    status === "fail" ? item.failureDescription || "" : undefined,
                            }
                            : item
                    ),
                };
            })
        );
    };

    const updateFailureDescription = (
        sectionId: string,
        itemId: string,
        description: string
    ) => {
        setSections((prev) =>
            prev.map((section) => {
                if (section.id !== sectionId) return section;

                return {
                    ...section,
                    items: section.items.map((item) =>
                        item.id === itemId ? { ...item, failureDescription: description } : item
                    ),
                };
            })
        );
    };

    const allItems = sections.flatMap((s) => s.items);
    const checkedItems = allItems.filter((i) => i.status !== null).length;
    const totalItems = allItems.length;
    const totalFails = allItems.filter((i) => i.status === "fail").length;
    const progressPercent = Math.round((checkedItems / totalItems) * 100);
    const overallStatus = totalFails > 0 ? "FAIL" : "PASS";

    const handleSubmit = async () => {
        if (!companyId) return;

        if (!formData.reg_number) {
            toast({
                title: "Rego required",
                description: "Please enter a rego before submitting.",
                variant: "destructive",
            });
            return;
        }

        const checklistData = sections.map((section) => ({
            section: section.title,
            items: section.items.map((item) => ({
                label: item.label,
                status: item.status || "n/a",
                failureDescription: item.failureDescription,
            })),
        }));

        const insertPayload: any = {
            company_id: companyId,
            vehicle_id: vehicleId,
            inspection_date: new Date().toISOString().split("T")[0],
            inspector_name: formData.inspector,
            odometer_reading: parseInt(formData.odometer) || null,
            overall_result: overallStatus.toLowerCase(),
            checklist: checklistData,
            notes: formData.general_notes,
            status: "completed",
        };

        const { data, error } = await supabase
            .from("wof_inspections")
            .insert([insertPayload])
            .select()
            .single();

        if (error) {
            toast({
                title: "Error",
                description: "Failed to create WOF inspection",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Success",
            description: "WOF inspection submitted successfully",
        });

        router.push(`/dashboard/wof/${data.id}`);
    };

    return (
        <AppLayout companyId={companyId}>
            <div className="bg-slate-50 min-h-full pb-24">
                <div className="max-w-5xl mx-auto p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-900 bg-white border shadow-sm"
                                    onClick={() => router.back()}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                WOF Inspection
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {totalFails > 0 ? (
                                <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-600 border-red-200 px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md"
                                >
                                    <AlertCircle className="w-4 h-4" /> {totalFails} fail
                                </Badge>
                            ) : checkedItems > 0 && checkedItems === totalItems ? (
                                <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-600 border-green-200 px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 rounded-md"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Pass
                                </Badge>
                            ) : null}

                            <Button
                                onClick={handleSubmit}
                                className="bg-blue-500 hover:bg-blue-600 text-white h-9 text-sm px-4 shadow-sm border-0"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2 opacity-80" />
                                Submit Inspection
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                            <span>{checkedItems} / {totalItems} items checked</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <Progress
                            value={progressPercent}
                            className={`h-1 bg-gray-200 ${totalFails > 0 ? "[&>div]:bg-red-400" : "[&>div]:bg-blue-500"
                                }`}
                        />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">
                                    Vehicle & Inspector Details
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Enter rego to auto-fetch vehicle and customer details.
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                                <Search className="w-3.5 h-3.5" />
                                Rego Lookup
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <Label className="text-sm text-slate-700 font-medium mb-2 block">
                                    Rego *
                                </Label>
                                <div className="flex gap-3">
                                    <Input
                                        value={formData.reg_number}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                reg_number: e.target.value.toUpperCase(),
                                            }))
                                        }
                                        onBlur={(e) => lookupVehicleByRego(e.target.value)}
                                        placeholder="Enter rego e.g. ABC123"
                                        className="h-11 border-slate-300 shadow-none text-sm rounded-xl"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => lookupVehicleByRego(formData.reg_number)}
                                        disabled={!formData.reg_number || isLookingUpRego}
                                        className="h-11 px-5 rounded-xl border-slate-300"
                                    >
                                        {isLookingUpRego ? "Searching..." : "Fetch"}
                                    </Button>
                                </div>

                                {!!regoLookupMessage && (
                                    <div
                                        className={`mt-3 rounded-xl px-4 py-3 text-sm border ${regoLookupError
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            }`}
                                    >
                                        {regoLookupMessage}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label className="text-sm text-slate-700 font-medium mb-2 block">
                                    Vehicle
                                </Label>
                                <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center gap-2 text-sm text-slate-700">
                                    <CarFront className="w-4 h-4 text-slate-400" />
                                    <span className={formData.vehicle ? "text-slate-700" : "text-slate-400"}>
                                        {formData.vehicle || "Vehicle details will appear here"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm text-slate-700 font-medium mb-2 block">
                                    Customer
                                </Label>
                                <div className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 flex items-center gap-2 text-sm text-slate-700">
                                    <UserRound className="w-4 h-4 text-slate-400" />
                                    <span className={formData.customer ? "text-slate-700" : "text-slate-400"}>
                                        {formData.customer || "Customer name will appear here"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm text-slate-700 font-medium mb-2 block">
                                    Inspector
                                </Label>
                                <Input
                                    value={formData.inspector}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, inspector: e.target.value }))
                                    }
                                    placeholder="Enter inspector name"
                                    className="h-11 border-slate-300 shadow-none text-sm rounded-xl"
                                />
                            </div>

                            <div>
                                <Label className="text-sm text-slate-700 font-medium mb-2 block">
                                    Odometer (km)
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.odometer}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, odometer: e.target.value }))
                                    }
                                    placeholder="Enter odometer reading"
                                    className="h-11 border-slate-300 shadow-none text-sm rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {sections.map((section) => {
                            const sectionChecked = section.items.filter((i) => i.status !== null).length;
                            const sectionTotal = section.items.length;
                            const sectionFails = section.items.filter((i) => i.status === "fail").length;

                            return (
                                <div
                                    key={section.id}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all"
                                >
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-2 h-2 rounded-full ${sectionFails > 0
                                                        ? "bg-red-500"
                                                        : sectionChecked === sectionTotal
                                                            ? "bg-green-500"
                                                            : "bg-yellow-400"
                                                    }`}
                                            />
                                            <div>
                                                <h3 className="font-semibold text-sm text-gray-800">{section.title}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {sectionChecked}/{sectionTotal} checked
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {sectionFails > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-red-50 text-red-600 border-red-200 px-2 py-0.5 text-xs font-medium rounded"
                                                >
                                                    {sectionFails} fail
                                                </Badge>
                                            )}
                                            {section.expanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {section.expanded && (
                                        <div className="px-4 pb-2">
                                            {section.items.map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className={`py-4 ${index !== 0 ? "border-t border-gray-100" : ""}`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 pr-6">
                                                            <div className="flex items-center gap-2">
                                                                {item.status === "fail" && (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                )}
                                                                <Label
                                                                    className={`text-sm font-medium ${item.status === "fail" ? "text-red-600" : "text-gray-700"
                                                                        }`}
                                                                >
                                                                    {item.label}
                                                                </Label>
                                                            </div>

                                                            {item.status === "fail" && (
                                                                <div className="mt-3 ml-3.5">
                                                                    <Input
                                                                        placeholder="Describe the issue..."
                                                                        value={item.failureDescription || ""}
                                                                        onChange={(e) =>
                                                                            updateFailureDescription(section.id, item.id, e.target.value)
                                                                        }
                                                                        className="border-red-200 focus-visible:ring-red-400 focus-visible:border-red-400 placeholder:text-red-300 text-sm h-10 shadow-sm"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end gap-3 shrink-0">
                                                            <div className="flex gap-2.5 text-gray-300 mr-2">
                                                                <FileText className="w-4 h-4 hover:text-gray-500 cursor-pointer" />
                                                                <ImageIcon className="w-4 h-4 hover:text-gray-500 cursor-pointer" />
                                                                <Video className="w-4 h-4 hover:text-gray-500 cursor-pointer" />
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateItemStatus(section.id, item.id, "pass");
                                                                    }}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${item.status === "pass"
                                                                            ? "bg-green-500 text-white border border-green-600 shadow-sm"
                                                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                                                        }`}
                                                                >
                                                                    <CheckCircle2
                                                                        className={`w-3.5 h-3.5 ${item.status === "pass" ? "text-white" : "text-gray-400"
                                                                            }`}
                                                                    />
                                                                    Pass
                                                                </button>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateItemStatus(section.id, item.id, "fail");
                                                                    }}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${item.status === "fail"
                                                                            ? "bg-red-500 text-white border border-red-600 shadow-sm"
                                                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                                                        }`}
                                                                >
                                                                    <XCircle
                                                                        className={`w-3.5 h-3.5 ${item.status === "fail" ? "text-white" : "text-gray-400"
                                                                            }`}
                                                                    />
                                                                    Fail
                                                                </button>

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        updateItemStatus(section.id, item.id, "n/a");
                                                                    }}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${item.status === "n/a"
                                                                            ? "bg-gray-700 text-white border border-gray-800 shadow-sm"
                                                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                                                        }`}
                                                                >
                                                                    <Slash
                                                                        className={`w-3.5 h-3.5 ${item.status === "n/a" ? "text-white" : "text-gray-400"
                                                                            }`}
                                                                    />
                                                                    N/A
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                        <h2 className="text-sm font-medium text-gray-800 mb-3">General Notes</h2>
                        <Textarea
                            className="min-h-[100px] border-gray-200 shadow-none text-sm placeholder:text-gray-400"
                            value={formData.general_notes}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, general_notes: e.target.value }))
                            }
                            placeholder="Any additional notes for this inspection..."
                        />
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-20 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-600 font-medium">{checkedItems}/{totalItems} checked</span>
                        {totalFails > 0 ? (
                            <span className="text-red-500 font-semibold">
                                {totalFails} fail — will be marked FAIL
                            </span>
                        ) : checkedItems === totalItems ? (
                            <span className="text-green-600 font-semibold">Ready to be marked PASS</span>
                        ) : (
                            <span className="text-gray-400 font-medium italic">
                                Complete checklist to submit
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm px-6 h-10"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Inspection
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}