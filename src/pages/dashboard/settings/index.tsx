import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { companyService } from "@/services/companyService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    Bell,
    BookOpen,
    Boxes,
    Building2,
    CreditCard,
    FileText,
    Hash,
    Mail,
    Package,
    Settings2,
    Shield,
    Tags,
    Truck,
    Wrench,
    Plus,
    Save,
    RefreshCcw,
    Database,
    PanelLeftOpen,
    PanelTopOpen,
} from "lucide-react";

type SettingsTab =
    | "business"
    | "documents"
    | "templates"
    | "notifications"
    | "serviceAttributes"
    | "booking"
    | "numbering"
    | "catalogs"
    | "payments"
    | "branding"
    | "advanced"
    | "dataTools";

type DocumentType = "invoice" | "quote" | "jobCard" | "courtesyVehicle";

type SettingsShape = {
    business: {
        workshopName: string;
        gstNumber: string;
        licenceDetails: string;
        wofAuthorizationNo: string;
        servicingType: string;
        registeredForGst: boolean;
        pricesIncludeGst: boolean;
        sendBookingReminder: boolean;
        sendBookingConfirmation: boolean;
        bookingReminderBy: "email" | "sms";
        dataExportEmail: string;
        openingHours: string;
        phone: string;
        fax: string;
        address: string;
        website: string;
        email: string;
        advertisingImageUrl: string;
    };
    documents: {
        invoice: {
            currentNumber: string;
            footer: string;
            rounding: string;
            templateName: string;
            termsAttachment: string;
            markupLevel1: string;
            surchargePercent: number;
            surchargeAccount: string;
        };
        quote: {
            expiryDays: string;
            templateName: string;
            rounding: string;
            quoteFooter: string;
            estimateFooter: string;
            termsAttachment: string;
        };
        jobCard: {
            currentNumber: string;
            templateName: string;
            customerSignOffRequired: boolean;
            printTimesheets: boolean;
            printCustomerAddress: boolean;
            termsAttachment: string;
        };
        courtesyVehicle: {
            authorizationStatement: string;
            termsAttachment: string;
        };
    };
    templates: {
        navigationLayout: "vertical" | "horizontal";
    };
    notifications: Array<{
        key: string;
        name: string;
        enabled: boolean;
        method: string;
        destination: string;
        description: string;
    }>;
    serviceAttributes: {
        serviceItemLabel: string;
        serviceItemPluralLabel: string;
        enabledAttributes: string[];
        customAttributesNote: string;
    };
    booking: {
        bookingUrl: string;
        availableJobTypes: string[];
        disableFullyBookedDates: boolean;
        showAddressInput: boolean;
        disableTimeSelection: boolean;
        notificationSentTo: string;
        confirmationChannel: "email" | "sms" | "both";
    };
    numbering: Array<{ key: string; label: string; prefix: string; nextNumber: number }>;
    catalogs: {
        jobCategories: string[];
        businessSources: string[];
        reasonsOnHold: string[];
        reasonsCancelQuote: string[];
        tagsByEntity: Record<string, string[]>;
        shippingOptions: string[];
    };
    payments: {
        methods: Array<{
            key: string;
            name: string;
            type: string;
            active: boolean;
            posEnabled: boolean;
            hasFee: boolean;
            feeAmount: number;
            feeType: string;
        }>;
        defaultCustomerPaymentTerm: string;
        defaultSupplierPaymentTerm: string;
    };
    branding: {
        logoUrl: string;
        logoBgColor: string;
        logoAlignment: "left" | "center" | "right";
        logoPosition: "top" | "middle";
        emailFooter: string;
        barcodeSystem: string;
        barcodeTemplate: string;
        labelTemplate: string;
    };
    advanced: {
        quoteTitle: string;
        priceLevelNames: string[];
        printMarginTop: string;
        printMarginBottom: string;
        printMarginLeft: string;
        printMarginRight: string;
        printQuotePriceIncludeTax: boolean;
        printInvoicePriceIncludeTax: boolean;
        printGstAmount: boolean;
        printWithoutStockNumber: boolean;
        fitMoreOnInvoice: boolean;
        useLargeLogo: boolean;
        useFullSizeLogo: boolean;
        calculateAgingDebtorsByInvoiceDueDate: boolean;
        printUnitPriceTwoDecimal: boolean;
        workshopNameWhenSendSms: string;
        automaticPriceUpdate: boolean;
        automaticCostUpdate: boolean;
        setInvoiceIssueDateAtFinalization: boolean;
        disableItemPriceOnPurchaseOrder: boolean;
        showPaymentsOnInvoice: boolean;
        defaultOdometerUnit: string;
        defaultHubodometerUnit: string;
        printInvoiceHeaderItemTotal: boolean;
        useWorkshopNameOnJobCardNoLogo: boolean;
        printPaymentTermOnInvoice: boolean;
        hideInvoiceItemWithZeroTotal: boolean;
        showCustomerNumberOnInvoiceAndStatement: boolean;
        doNotPrintInvoiceDescriptionOnStatement: boolean;
        printTimesheetDetailsOnJobCard: boolean;
        printJobStartDateOnInvoice: boolean;
        printOnPaperWithLetterhead: boolean;
        doNotPrintInvoiceDetails: boolean;
        printCustomerAddressOnJobCard: boolean;
        disableWof: boolean;
        defaultDiaryView: string;
        hideFinishedJobsOnDiaryByDefault: boolean;
        defaultBookingTime: string;
        defaultPickupTime: string;
    };
    dataTools: {
        exportSelections: string[];
        exportFormat: "xlsx" | "csv";
        exportFromDate: string;
        importNote: string;
        currentRequestStatus: string;
    };
};

type SettingRecord = {
    id: string;
    settings_payload: SettingsShape;
};

const serviceAttributeOptions = [
    "Registration Number",
    "Fleet Number",
    "Driver Name",
    "Driver Phone",
    "Driver Email",
    "Make",
    "Model",
    "Series",
    "Model Code",
    "Year",
    "Color",
    "Body",
    "Fuel Tank Expiry Date",
    "Odometer Unit",
    "Tyre Size",
    "Compliance Plate Date",
    "GVM",
    "GCM",
    "Engine Brand",
    "Engine Model",
    "Engine Year",
    "Trailer Brand",
    "Trailer Model",
    "Trailer Registration Number",
    "Boat Name",
];

const exportResources = [
    "Suppliers",
    "Customers",
    "Vehicles",
    "Inventory",
    "Job Types",
    "Jobs",
    "Timesheets",
    "Quotes",
    "Invoices",
    "Bills",
    "Purchase Orders",
    "Emails",
    "SMS",
];

const settingsNav: Array<{ key: SettingsTab; label: string; icon: any; description: string }> = [
    { key: "business", label: "Business Profile", icon: Building2, description: "Workshop identity, GST, contact and operating defaults" },
    { key: "documents", label: "Documents", icon: FileText, description: "Invoices, quotes, job cards and courtesy vehicle output" },
    { key: "templates", label: "Templates & Messages", icon: Mail, description: "Customer-facing email and SMS templates" },
    { key: "notifications", label: "Internal Notifications", icon: Bell, description: "Workshop alerts for signatures, bookings and replies" },
    { key: "serviceAttributes", label: "Vehicle & Service Fields", icon: Wrench, description: "Master attributes used across jobs, quotes and invoices" },
    { key: "booking", label: "Online Booking", icon: BookOpen, description: "Website booking configuration and notification routing" },
    { key: "numbering", label: "Numbering Rules", icon: Hash, description: "Prefixes and next numbers for operational documents" },
    { key: "catalogs", label: "Categories, Tags & Sources", icon: Tags, description: "Shared dropdowns and workflow reasons" },
    { key: "payments", label: "Payments", icon: CreditCard, description: "Accepted methods, fees and default terms" },
    { key: "branding", label: "Branding & Print", icon: Package, description: "Email/logo/barcode/label output settings" },
    { key: "advanced", label: "Advanced Rules", icon: Settings2, description: "Print logic, odometer units and workflow behavior" },
    { key: "dataTools", label: "Data Tools", icon: Database, description: "Controlled export, import and bulk-delete requests" },
];

const commTemplateLibrary = [
    "Booking Confirmation",
    "Booking Reminder",
    "Courtesy Vehicle Booking",
    "Email Customer Statement",
    "Email Invoice",
    "Email Job Card",
    "Email Payment Receipt",
    "Email Purchase Order",
    "Email Quote",
    "Job Done Email",
    "Job Done SMS",
    "Registration Reminder",
    "Request Invoice Signature",
    "Request Job Card Signature",
    "Request Quote Signature",
    "Service Reminder",
    "WOF Reminder",
];

const defaultSettings = (companyName = "Workshop", companyEmail = "", companyPhone = "", address = ""): SettingsShape => ({
    business: {
        workshopName: companyName,
        gstNumber: "",
        licenceDetails: "",
        wofAuthorizationNo: "",
        servicingType: "Cars",
        registeredForGst: true,
        pricesIncludeGst: false,
        sendBookingReminder: true,
        sendBookingConfirmation: true,
        bookingReminderBy: "email",
        dataExportEmail: companyEmail,
        openingHours: "Mon-Fri 8:00am-5:00pm",
        phone: companyPhone,
        fax: "",
        address,
        website: "",
        email: companyEmail,
        advertisingImageUrl: "",
    },
    documents: {
        invoice: {
            currentNumber: "INV-4900",
            footer: "Thank you for giving us the opportunity to service your car.",
            rounding: "No rounding",
            templateName: "Modern Invoice",
            termsAttachment: "",
            markupLevel1: "",
            surchargePercent: 2,
            surchargeAccount: "",
        },
        quote: {
            expiryDays: "7",
            templateName: "Quote Template 007",
            rounding: "No rounding",
            quoteFooter: "Thank you for giving us the opportunity to service your car.",
            estimateFooter: "Thank you for giving us the opportunity to service your car.",
            termsAttachment: "",
        },
        jobCard: {
            currentNumber: "1321",
            templateName: "Print",
            customerSignOffRequired: false,
            printTimesheets: false,
            printCustomerAddress: false,
            termsAttachment: "",
        },
        courtesyVehicle: {
            authorizationStatement: "",
            termsAttachment: "",
        },
    },
    templates: {
        navigationLayout: "vertical",
    },
    notifications: [
        { key: "booking-request", name: "Booking Request", enabled: false, method: "email", destination: companyEmail, description: "Notify the workshop when a new booking request is submitted." },
        { key: "courtesy-vehicle-signature", name: "Courtesy Vehicle Signature", enabled: true, method: "email", destination: companyEmail, description: "Notification when a courtesy vehicle signature is successfully added." },
        { key: "invoice-signature", name: "Invoice Signature", enabled: true, method: "email", destination: companyEmail, description: "Notification when an invoice signature is successfully added." },
        { key: "job-signature", name: "Job Signature", enabled: true, method: "email", destination: companyEmail, description: "Notification when a job signature is successfully added." },
        { key: "payment-request-success", name: "Payment Request Success", enabled: true, method: "email", destination: companyEmail, description: "Notification when a payment request completes successfully." },
        { key: "quote-accepted", name: "Quote Accepted", enabled: true, method: "email", destination: companyEmail, description: "Notify the workshop when a quote is accepted by the customer." },
        { key: "quote-signature", name: "Quote Signature", enabled: true, method: "email", destination: companyEmail, description: "Notification when a quote signature is successfully added." },
        { key: "sms-reply", name: "SMS Reply", enabled: true, method: "email", destination: companyEmail, description: "Notify the workshop when a customer replies to an SMS." },
    ],
    serviceAttributes: {
        serviceItemLabel: "Vehicle",
        serviceItemPluralLabel: "Vehicles",
        enabledAttributes: ["Registration Number", "Make", "Model", "Year", "Body", "Tyre Size", "Odometer Unit"],
        customAttributesNote: "Manage custom attributes in this panel to keep the document builder consistent.",
    },
    booking: {
        bookingUrl: "",
        availableJobTypes: ["Car Service", "Tyre", "Wheel Alignment"],
        disableFullyBookedDates: true,
        showAddressInput: false,
        disableTimeSelection: false,
        notificationSentTo: companyEmail,
        confirmationChannel: "email",
    },
    numbering: [
        { key: "job", label: "Job", prefix: "JOB", nextNumber: 1322 },
        { key: "invoice", label: "Invoice", prefix: "INV", nextNumber: 4901 },
        { key: "customer", label: "Customer", prefix: "CUS", nextNumber: 1002 },
        { key: "credit-note", label: "Credit Note", prefix: "CN", nextNumber: 205 },
        { key: "quote", label: "Quote", prefix: "QUO", nextNumber: 701 },
        { key: "bill", label: "Bill", prefix: "BIL", nextNumber: 320 },
        { key: "purchase-order", label: "Purchase Order", prefix: "PO", nextNumber: 128 },
        { key: "supplier-credit-note", label: "Supplier Credit Note", prefix: "SCN", nextNumber: 84 },
    ],
    catalogs: {
        jobCategories: ["Car Service", "Puncture Repair", "Strip, Fit and Balance", "Tyre", "Wheel Alignment", "WOF"],
        businessSources: ["Repeat Customer", "Walk In", "Website Booking", "Referral"],
        reasonsOnHold: ["Waiting on parts", "Waiting on customer confirmation", "Customer missed appointment", "To be rescheduled"],
        reasonsCancelQuote: ["Price declined", "Customer postponed", "Duplicate quote"],
        tagsByEntity: {
            jobs: ["Urgent", "Fleet", "Waiting Parts"],
            invoices: ["Paid", "Overdue"],
            quotes: ["Follow Up", "Insurance"],
            customers: ["VIP", "Trade"],
            vehicles: ["Diesel", "Trailer"],
            stock: ["Fast Moving", "Special Order"],
        },
        shippingOptions: ["Pickup", "Courier", "Workshop Delivery"],
    },
    payments: {
        methods: [
            { key: "cash", name: "Cash", type: "cash", active: true, posEnabled: true, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "eftpos", name: "EFTPOS", type: "eftpos", active: true, posEnabled: true, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "credit-card", name: "Credit Card", type: "card", active: true, posEnabled: true, hasFee: true, feeAmount: 2, feeType: "percentage" },
            { key: "afterpay", name: "Afterpay", type: "other", active: true, posEnabled: true, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "bank-transfer", name: "Bank Transfer", type: "bank_transfer", active: true, posEnabled: false, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "zip", name: "ZIP", type: "other", active: true, posEnabled: true, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "chargeback", name: "Chargeback", type: "other", active: true, posEnabled: false, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "credit-note", name: "Credit Note", type: "credit_note", active: true, posEnabled: true, hasFee: false, feeAmount: 0, feeType: "fixed" },
            { key: "other", name: "Other", type: "other", active: true, posEnabled: true, hasFee: false, feeAmount: 0, feeType: "fixed" },
        ],
        defaultCustomerPaymentTerm: "COD",
        defaultSupplierPaymentTerm: "20th of next month",
    },
    branding: {
        logoUrl: "",
        logoBgColor: "#ffffff",
        logoAlignment: "left",
        logoPosition: "top",
        emailFooter: "Thank you for giving us the opportunity to service your car.",
        barcodeSystem: "128A",
        barcodeTemplate: "Default (105x40)",
        labelTemplate: "Default",
    },
    advanced: {
        quoteTitle: "Quote",
        priceLevelNames: ["Sell Price", "Price Lvl 2", "Price Lvl 3", "Price Lvl 4", "Price Lvl 5", "Price Lvl 6", "Price Lvl 7"],
        printMarginTop: "10",
        printMarginBottom: "10",
        printMarginLeft: "10",
        printMarginRight: "10",
        printQuotePriceIncludeTax: false,
        printInvoicePriceIncludeTax: false,
        printGstAmount: false,
        printWithoutStockNumber: false,
        fitMoreOnInvoice: true,
        useLargeLogo: false,
        useFullSizeLogo: false,
        calculateAgingDebtorsByInvoiceDueDate: false,
        printUnitPriceTwoDecimal: false,
        workshopNameWhenSendSms: companyName,
        automaticPriceUpdate: false,
        automaticCostUpdate: false,
        setInvoiceIssueDateAtFinalization: false,
        disableItemPriceOnPurchaseOrder: false,
        showPaymentsOnInvoice: false,
        defaultOdometerUnit: "Kms",
        defaultHubodometerUnit: "Kms",
        printInvoiceHeaderItemTotal: false,
        useWorkshopNameOnJobCardNoLogo: false,
        printPaymentTermOnInvoice: false,
        hideInvoiceItemWithZeroTotal: false,
        showCustomerNumberOnInvoiceAndStatement: false,
        doNotPrintInvoiceDescriptionOnStatement: false,
        printTimesheetDetailsOnJobCard: false,
        printJobStartDateOnInvoice: false,
        printOnPaperWithLetterhead: false,
        doNotPrintInvoiceDetails: false,
        printCustomerAddressOnJobCard: false,
        disableWof: false,
        defaultDiaryView: "Week",
        hideFinishedJobsOnDiaryByDefault: false,
        defaultBookingTime: "08:00",
        defaultPickupTime: "17:00",
    },
    dataTools: {
        exportSelections: ["Customers", "Vehicles", "Inventory"],
        exportFormat: "xlsx",
        exportFromDate: "",
        importNote: "Phase one recommendation: full export, guided import for safe datasets only.",
        currentRequestStatus: "idle",
    },
});

const sectionCard = "rounded-2xl border border-slate-200 bg-white shadow-sm";

export default function DashboardSettingsPage() {
    const { toast } = useToast();
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [settingRowId, setSettingRowId] = useState < string | null > (null);
    const [activeTab, setActiveTab] = useState < SettingsTab > ("business");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState < SettingsShape > (defaultSettings());
    const [templateBodies, setTemplateBodies] = useState < Record < string, { subject: string; body: string; channel: string
}>> ({});

useEffect(() => {
    void loadSettings();
}, []);

const loadSettings = async () => {
    try {
        setLoading(true);
        const company = await companyService.getCurrentCompany();
        if (!company) {
            toast({ title: "No company found", description: "Please finish company setup before editing settings.", variant: "destructive" });
            return;
        }
        setCompanyId(company.id);
        setCompanyName(company.name);

        const defaults = defaultSettings(company.name, company.email || "", company.phone || "", company.address || "");
        setSettings(defaults);

        const { data: row } = await (supabase as any)
            .from("company_settings")
            .select("id, settings_payload")
            .eq("company_id", company.id)
            .maybeSingle();

        if (row?.settings_payload) {
            setSettingRowId(row.id);
            const merged = deepMerge(defaults, row.settings_payload as Partial<SettingsShape>);
            setSettings(merged);
            if (typeof window !== "undefined" && merged.templates?.navigationLayout) localStorage.setItem("workshoppro:nav-layout", merged.templates.navigationLayout);
        } else if (typeof window !== "undefined") {
            localStorage.setItem("workshoppro:nav-layout", defaults.templates.navigationLayout);
        }

        const { data: templates } = await supabase
            .from("communication_templates")
            .select("template_type, subject, body, channel")
            .eq("company_id", company.id) as any;

        const templateMap: Record<string, { subject: string; body: string; channel: string }> = {};
        for (const key of commTemplateLibrary) {
            const existing = templates?.find((t: any) => t.template_type === key);
            templateMap[key] = {
                subject: existing?.subject || key,
                body: existing?.body || `Hello {{customer_name}},\n\nThis is your ${key.toLowerCase()} from ${company.name}.`,
                channel: existing?.channel || (key.toLowerCase().includes("sms") ? "sms" : "email"),
            };
        }
        setTemplateBodies(templateMap);
    } catch (error) {
        console.error(error);
        toast({ title: "Failed to load settings", description: "Please refresh and try again.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
};

const saveSettings = async () => {
    if (!companyId) return;
    try {
        setSaving(true);
        const payload = { company_id: companyId, settings_payload: settings, updated_at: new Date().toISOString() };
        if (typeof window !== "undefined") localStorage.setItem("workshoppro:nav-layout", settings.templates.navigationLayout);
        if (settingRowId) {
            const { error } = await (supabase as any).from("company_settings").update(payload).eq("id", settingRowId);
            if (error) throw error;
        } else {
            const { data, error } = await (supabase as any).from("company_settings").insert(payload).select("id").single();
            if (error) throw error;
            setSettingRowId(data.id);
        }

        for (const [templateType, template] of Object.entries(templateBodies)) {
            const { data: existing } = await supabase
                .from("communication_templates")
                .select("id")
                .eq("company_id", companyId)
                .eq("template_type", templateType)
                .maybeSingle() as any;

            if (existing?.id) {
                await supabase.from("communication_templates").update({
                    subject: template.subject,
                    body: template.body,
                    channel: template.channel,
                } as any).eq("id", existing.id);
            } else {
                await supabase.from("communication_templates").insert({
                    company_id: companyId,
                    name: templateType,
                    template_type: templateType,
                    channel: template.channel,
                    subject: template.subject,
                    body: template.body,
                    is_active: true,
                } as any);
            }
        }

        toast({ title: "Settings saved", description: "Company settings were updated successfully." });
    } catch (error: any) {
        console.error(error);
        toast({ title: "Save failed", description: error.message || "Could not save settings.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
};

const requestExport = async () => {
    if (!companyId) return;
    try {
        const { error } = await (supabase as any).from("company_data_requests").insert({
            company_id: companyId,
            request_type: "export",
            status: "queued",
            payload: {
                resources: settings.dataTools.exportSelections,
                format: settings.dataTools.exportFormat,
                fromDate: settings.dataTools.exportFromDate || null,
            },
        });
        if (error) throw error;
        setSettings((prev) => ({ ...prev, dataTools: { ...prev.dataTools, currentRequestStatus: "queued" } }));
        toast({ title: "Export requested", description: "A background export request was created." });
    } catch (error: any) {
        toast({ title: "Export request failed", description: error.message, variant: "destructive" });
    }
};

const setSection = <K extends keyof SettingsShape>(key: K, value: SettingsShape[K]) => setSettings((prev) => ({ ...prev, [key]: value }));

const activeSection = useMemo(() => settingsNav.find((item) => item.key === activeTab), [activeTab]);

return (
    <AppLayout companyId={companyId} companyName={companyName}>
        <div className="mx-auto w-full max-w-[1680px] space-y-6 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">Company Settings</p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Operations control centre</h1>
                    <p className="mt-1 max-w-3xl text-sm text-slate-500">
                        Configure workshop behavior, document output, customer communication, numbering, payments, and safe data tools without duplicating staff/admin controls.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadSettings} disabled={loading || saving}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={saveSettings} disabled={loading || saving} className="bg-[#123E97] hover:bg-[#0f327c] text-white">
                        <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save settings"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                <Card className={cn(sectionCard, "h-fit xl:sticky xl:top-20")}>
                    <CardHeader>
                        <CardTitle className="text-base">Settings areas</CardTitle>
                        <CardDescription>Feature-complete company controls under /dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {settingsNav.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setActiveTab(item.key)}
                                    className={cn(
                                        "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                                        activeTab === item.key ? "border-[#123E97] bg-[#123E97]/5" : "border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn("mt-0.5 rounded-lg p-2", activeTab === item.key ? "bg-[#123E97] text-white" : "bg-slate-100 text-slate-600")}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{item.label}</div>
                                            <div className="mt-1 text-xs text-slate-500">{item.description}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className={sectionCard}>
                        <CardHeader>
                            <CardTitle>{activeSection?.label}</CardTitle>
                            <CardDescription>{activeSection?.description}</CardDescription>
                        </CardHeader>
                    </Card>

                    {loading ? (
                        <Card className={sectionCard}><CardContent className="p-8 text-sm text-slate-500">Loading settings…</CardContent></Card>
                    ) : (
                        <>
                            {activeTab === "business" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Workshop profile</CardTitle><CardDescription>Drives GST behavior, print headers, booking communication, and contact identity.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field label="Workshop name"><Input value={settings.business.workshopName} onChange={(e) => setSection("business", { ...settings.business, workshopName: e.target.value })} /></Field>
                                            <Field label="GST registration number"><Input value={settings.business.gstNumber} onChange={(e) => setSection("business", { ...settings.business, gstNumber: e.target.value })} /></Field>
                                            <Field label="Licence details"><Input value={settings.business.licenceDetails} onChange={(e) => setSection("business", { ...settings.business, licenceDetails: e.target.value })} /></Field>
                                            <Field label="WOF authorisation no."><Input value={settings.business.wofAuthorizationNo} onChange={(e) => setSection("business", { ...settings.business, wofAuthorizationNo: e.target.value })} /></Field>
                                            <Field label="Servicing focus"><Input value={settings.business.servicingType} onChange={(e) => setSection("business", { ...settings.business, servicingType: e.target.value })} /></Field>
                                            <Field label="Data export sent to"><Input type="email" value={settings.business.dataExportEmail} onChange={(e) => setSection("business", { ...settings.business, dataExportEmail: e.target.value })} /></Field>
                                            <Field label="Phone"><Input value={settings.business.phone} onChange={(e) => setSection("business", { ...settings.business, phone: e.target.value })} /></Field>
                                            <Field label="Fax"><Input value={settings.business.fax} onChange={(e) => setSection("business", { ...settings.business, fax: e.target.value })} /></Field>
                                            <Field label="Email"><Input type="email" value={settings.business.email} onChange={(e) => setSection("business", { ...settings.business, email: e.target.value })} /></Field>
                                            <Field label="Website"><Input value={settings.business.website} onChange={(e) => setSection("business", { ...settings.business, website: e.target.value })} /></Field>
                                            <div className="md:col-span-2"><Field label="Address"><Textarea rows={3} value={settings.business.address} onChange={(e) => setSection("business", { ...settings.business, address: e.target.value })} /></Field></div>
                                            <div className="md:col-span-2"><Field label="Opening hours"><Textarea rows={2} value={settings.business.openingHours} onChange={(e) => setSection("business", { ...settings.business, openingHours: e.target.value })} /></Field></div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            <ToggleRow label="Registered for GST" checked={settings.business.registeredForGst} onCheckedChange={(checked) => setSection("business", { ...settings.business, registeredForGst: checked })} />
                                            <ToggleRow label="Prices include GST" checked={settings.business.pricesIncludeGst} onCheckedChange={(checked) => setSection("business", { ...settings.business, pricesIncludeGst: checked })} />
                                            <ToggleRow label="Send booking reminder" checked={settings.business.sendBookingReminder} onCheckedChange={(checked) => setSection("business", { ...settings.business, sendBookingReminder: checked })} />
                                            <ToggleRow label="Send booking confirmation" checked={settings.business.sendBookingConfirmation} onCheckedChange={(checked) => setSection("business", { ...settings.business, sendBookingConfirmation: checked })} />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field label="Booking reminder by">
                                                <Select value={settings.business.bookingReminderBy} onValueChange={(value: any) => setSection("business", { ...settings.business, bookingReminderBy: value })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent>
                                                </Select>
                                            </Field>
                                            <Field label="Advertising image URL">
                                                <Input value={settings.business.advertisingImageUrl} onChange={(e) => setSection("business", { ...settings.business, advertisingImageUrl: e.target.value })} placeholder="Used on invoice footer/print output" />
                                            </Field>
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>
                            )}

                    {activeTab === "documents" && (
                        <Card className={sectionCard}>
                            <CardHeader><CardTitle>Document engine</CardTitle><CardDescription>Controls current numbers, templates, footers, surcharge rules and print behavior.</CardDescription></CardHeader>
                            <CardContent>
                                <Tabs defaultValue="invoice">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="invoice">Invoices</TabsTrigger>
                                        <TabsTrigger value="quote">Quotes</TabsTrigger>
                                        <TabsTrigger value="jobCard">Job Cards</TabsTrigger>
                                        <TabsTrigger value="courtesyVehicle">Courtesy Vehicles</TabsTrigger>
                                    </TabsList>
                                    {(["invoice", "quote", "jobCard", "courtesyVehicle"] as DocumentType[]).map((tab) => (
                                        <TabsContent key={tab} value={tab} className="mt-6">
                                            {tab === "invoice" && (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Field label="Current invoice number"><Input value={settings.documents.invoice.currentNumber} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, currentNumber: e.target.value } })} /></Field>
                                                    <Field label="Invoice template"><Input value={settings.documents.invoice.templateName} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, templateName: e.target.value } })} /></Field>
                                                    <Field label="Rounding"><Input value={settings.documents.invoice.rounding} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, rounding: e.target.value } })} /></Field>
                                                    <Field label="T&C attachment"><Input value={settings.documents.invoice.termsAttachment} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, termsAttachment: e.target.value } })} /></Field>
                                                    <Field label="Markup level 1"><Input value={settings.documents.invoice.markupLevel1} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, markupLevel1: e.target.value } })} /></Field>
                                                    <Field label="Credit card surcharge %"><Input type="number" value={settings.documents.invoice.surchargePercent} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, surchargePercent: Number(e.target.value) } })} /></Field>
                                                    <div className="md:col-span-2"><Field label="Invoice footer"><Textarea rows={4} value={settings.documents.invoice.footer} onChange={(e) => setSection("documents", { ...settings.documents, invoice: { ...settings.documents.invoice, footer: e.target.value } })} /></Field></div>
                                                </div>
                                            )}
                                            {tab === "quote" && (
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Field label="Expiry days"><Input value={settings.documents.quote.expiryDays} onChange={(e) => setSection("documents", { ...settings.documents, quote: { ...settings.documents.quote, expiryDays: e.target.value } })} /></Field>
                                                    <Field label="Quote template"><Input value={settings.documents.quote.templateName} onChange={(e) => setSection("documents", { ...settings.documents, quote: { ...settings.documents.quote, templateName: e.target.value } })} /></Field>
                                                    <Field label="Rounding"><Input value={settings.documents.quote.rounding} onChange={(e) => setSection("documents", { ...settings.documents, quote: { ...settings.documents.quote, rounding: e.target.value } })} /></Field>
                                                    <Field label="T&C attachment"><Input value={settings.documents.quote.termsAttachment} onChange={(e) => setSection("documents", { ...settings.documents, quote: { ...settings.documents.quote, termsAttachment: e.target.value } })} /></Field>
                                                    <div className="md:col-span-2"><Field label="Quote footer"><Textarea rows={4} value={settings.documents.quote.quoteFooter} onChange={(e) => setSection("documents", { ...settings.documents, quote: { ...settings.documents.quote, quoteFooter: e.target.value } })} /></Field></div>
                                                    <div className="md:col-span-2"><Field label="Estimate footer"><Textarea rows={4} value={settings.documents.quote.estimateFooter} onChange={(e) => setSection("documents", { ...settings.documents, quote: { ...settings.documents.quote, estimateFooter: e.target.value } })} /></Field></div>
                                                </div>
                                            )}
                                            {tab === "jobCard" && (
                                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    <Field label="Current job number"><Input value={settings.documents.jobCard.currentNumber} onChange={(e) => setSection("documents", { ...settings.documents, jobCard: { ...settings.documents.jobCard, currentNumber: e.target.value } })} /></Field>
                                                    <Field label="Job card template"><Input value={settings.documents.jobCard.templateName} onChange={(e) => setSection("documents", { ...settings.documents, jobCard: { ...settings.documents.jobCard, templateName: e.target.value } })} /></Field>
                                                    <Field label="T&C attachment"><Input value={settings.documents.jobCard.termsAttachment} onChange={(e) => setSection("documents", { ...settings.documents, jobCard: { ...settings.documents.jobCard, termsAttachment: e.target.value } })} /></Field>
                                                    <ToggleRow label="Customer sign-off required" checked={settings.documents.jobCard.customerSignOffRequired} onCheckedChange={(checked) => setSection("documents", { ...settings.documents, jobCard: { ...settings.documents.jobCard, customerSignOffRequired: checked } })} />
                                                    <ToggleRow label="Print timesheets" checked={settings.documents.jobCard.printTimesheets} onCheckedChange={(checked) => setSection("documents", { ...settings.documents, jobCard: { ...settings.documents.jobCard, printTimesheets: checked } })} />
                                                    <ToggleRow label="Print customer address" checked={settings.documents.jobCard.printCustomerAddress} onCheckedChange={(checked) => setSection("documents", { ...settings.documents, jobCard: { ...settings.documents.jobCard, printCustomerAddress: checked } })} />
                                                </div>
                                            )}
                                            {tab === "courtesyVehicle" && (
                                                <div className="grid gap-4">
                                                    <Field label="Authorization statement"><Textarea rows={5} value={settings.documents.courtesyVehicle.authorizationStatement} onChange={(e) => setSection("documents", { ...settings.documents, courtesyVehicle: { ...settings.documents.courtesyVehicle, authorizationStatement: e.target.value } })} /></Field>
                                                    <Field label="T&C attachment"><Input value={settings.documents.courtesyVehicle.termsAttachment} onChange={(e) => setSection("documents", { ...settings.documents, courtesyVehicle: { ...settings.documents.courtesyVehicle, termsAttachment: e.target.value } })} /></Field>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "templates" && (
                        <div className="space-y-6">
                            <Card className={sectionCard}>
                                <CardHeader><CardTitle>Navigation layout</CardTitle><CardDescription>Choose whether staff see the classic left sidebar or the new horizontal top navigation.</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[{ key: "vertical", label: "Vertical menu", description: "Best for staff who use many modules all day.", icon: PanelLeftOpen }, { key: "horizontal", label: "Horizontal menu", description: "Cleaner top navigation with more workspace width.", icon: PanelTopOpen }].map((option) => {
                                            const active = settings.templates.navigationLayout === option.key;
                                            const Icon = option.icon;
                                            return (
                                                <button key={option.key} type="button" onClick={() => setSection("templates", { navigationLayout: option.key as "vertical" | "horizontal" })} className={cn("rounded-2xl border p-5 text-left transition", active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50")}>
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}><Icon className="h-5 w-5" /></div>
                                                        <div><div className="font-semibold text-slate-900">{option.label}</div><div className="text-sm text-slate-500">{option.description}</div></div>
                                                    </div>
                                                    <Badge variant={active ? "default" : "secondary"}>{active ? "Current layout" : "Available"}</Badge>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className={sectionCard}>
                                <CardHeader><CardTitle>Communication templates</CardTitle><CardDescription>Customer-facing message templates for reminders, signatures, statements, invoices and job completion.</CardDescription></CardHeader>
                                <CardContent className="space-y-6">
                                    {commTemplateLibrary.map((templateType) => (
                                        <div key={templateType} className="rounded-xl border border-slate-200 p-4">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="font-semibold text-slate-900">{templateType}</div>
                                                    <div className="text-xs text-slate-500">Variables such as {'{{customer_name}}'}, {'{{rego}}'}, {'{{document_number}}'} can be used.</div>
                                                </div>
                                                <Badge variant="secondary">{templateBodies[templateType]?.channel || "email"}</Badge>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <Field label="Channel">
                                                    <Select value={templateBodies[templateType]?.channel || "email"} onValueChange={(value) => setTemplateBodies((prev) => ({ ...prev, [templateType]: { ...prev[templateType], channel: value } }))}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem></SelectContent>
                                                    </Select>
                                                </Field>
                                                <Field label="Subject"><Input value={templateBodies[templateType]?.subject || ""} onChange={(e) => setTemplateBodies((prev) => ({ ...prev, [templateType]: { ...prev[templateType], subject: e.target.value } }))} /></Field>
                                                <div className="md:col-span-2"><Field label="Message"><Textarea rows={5} value={templateBodies[templateType]?.body || ""} onChange={(e) => setTemplateBodies((prev) => ({ ...prev, [templateType]: { ...prev[templateType], body: e.target.value } }))} /></Field></div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            )}

                            {activeTab === "notifications" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Internal notifications</CardTitle><CardDescription>Event alerts routed back to the workshop for signatures, quote acceptance, booking requests and SMS replies.</CardDescription></CardHeader>
                                    <CardContent className="space-y-3">
                                        {settings.notifications.map((item, index) => (
                                            <div key={item.key} className="grid gap-3 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1.3fr_120px_120px_1.2fr_1.5fr]">
                                                <div>
                                                    <div className="font-medium text-slate-900">{item.name}</div>
                                                    <div className="text-xs text-slate-500">{item.description}</div>
                                                </div>
                                                <div className="flex items-center"><Badge className={item.enabled ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}>{item.enabled ? "Active" : "Disabled"}</Badge></div>
                                                <Field label="Method" className="space-y-1"><Input value={item.method} onChange={(e) => updateArrayItem("notifications", index, { ...item, method: e.target.value })} /></Field>
                                                <Field label="Destination" className="space-y-1"><Input value={item.destination} onChange={(e) => updateArrayItem("notifications", index, { ...item, destination: e.target.value })} /></Field>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm text-slate-600">Enabled</span>
                                                    <Switch checked={item.enabled} onCheckedChange={(checked) => updateArrayItem("notifications", index, { ...item, enabled: checked })} />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "serviceAttributes" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Vehicle & service field engine</CardTitle><CardDescription>Master field controls shared by vehicles, jobs, quotes and invoices.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field label="Service item label"><Input value={settings.serviceAttributes.serviceItemLabel} onChange={(e) => setSection("serviceAttributes", { ...settings.serviceAttributes, serviceItemLabel: e.target.value })} /></Field>
                                            <Field label="Plural label"><Input value={settings.serviceAttributes.serviceItemPluralLabel} onChange={(e) => setSection("serviceAttributes", { ...settings.serviceAttributes, serviceItemPluralLabel: e.target.value })} /></Field>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Enabled attributes</Label>
                                            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {serviceAttributeOptions.map((option) => {
                                                    const checked = settings.serviceAttributes.enabledAttributes.includes(option);
                                                    return (
                                                        <label key={option} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                                                            <Checkbox checked={checked} onCheckedChange={(next) => {
                                                                const enabled = new Set(settings.serviceAttributes.enabledAttributes);
                                                                if (next) enabled.add(option);
                                                                else enabled.delete(option);
                                                                setSection("serviceAttributes", { ...settings.serviceAttributes, enabledAttributes: Array.from(enabled) });
                                                            }} />
                                                            <span>{option}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <Field label="Custom attributes note"><Textarea rows={3} value={settings.serviceAttributes.customAttributesNote} onChange={(e) => setSection("serviceAttributes", { ...settings.serviceAttributes, customAttributesNote: e.target.value })} /></Field>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "booking" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Online booking</CardTitle><CardDescription>Website booking controls, customer form behavior and routing for workshop notifications.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field label="Booking URL"><Input value={settings.booking.bookingUrl} onChange={(e) => setSection("booking", { ...settings.booking, bookingUrl: e.target.value })} /></Field>
                                            <Field label="Notification sent to"><Input value={settings.booking.notificationSentTo} onChange={(e) => setSection("booking", { ...settings.booking, notificationSentTo: e.target.value })} /></Field>
                                            <Field label="Confirmation channel">
                                                <Select value={settings.booking.confirmationChannel} onValueChange={(value: any) => setSection("booking", { ...settings.booking, confirmationChannel: value })}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="sms">SMS</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
                                                </Select>
                                            </Field>
                                            <div>
                                                <Label className="text-sm font-medium">Available job types</Label>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {settings.booking.availableJobTypes.map((jobType) => <Badge key={jobType} variant="secondary">{jobType}</Badge>)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <ToggleRow label="Disable fully booked dates" checked={settings.booking.disableFullyBookedDates} onCheckedChange={(checked) => setSection("booking", { ...settings.booking, disableFullyBookedDates: checked })} />
                                            <ToggleRow label="Show address input" checked={settings.booking.showAddressInput} onCheckedChange={(checked) => setSection("booking", { ...settings.booking, showAddressInput: checked })} />
                                            <ToggleRow label="Disable time selection" checked={settings.booking.disableTimeSelection} onCheckedChange={(checked) => setSection("booking", { ...settings.booking, disableTimeSelection: checked })} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "numbering" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Numbering rules</CardTitle><CardDescription>Document prefixes and next numbers used by new records across the company side.</CardDescription></CardHeader>
                                    <CardContent className="space-y-3">
                                        {settings.numbering.map((row, index) => (
                                            <div key={row.key} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[1.5fr_160px_160px]">
                                                <div className="font-medium text-slate-900">{row.label}</div>
                                                <Field label="Prefix" className="space-y-1"><Input value={row.prefix} onChange={(e) => updateNumbering(index, { ...row, prefix: e.target.value })} /></Field>
                                                <Field label="Next number" className="space-y-1"><Input type="number" value={row.nextNumber} onChange={(e) => updateNumbering(index, { ...row, nextNumber: Number(e.target.value) })} /></Field>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "catalogs" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Categories, tags & sources</CardTitle><CardDescription>Shared operational lists used throughout the workflow.</CardDescription></CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="categories">
                                            <TabsList className="grid w-full grid-cols-5">
                                                <TabsTrigger value="categories">Job categories</TabsTrigger>
                                                <TabsTrigger value="sources">Business sources</TabsTrigger>
                                                <TabsTrigger value="hold">Hold reasons</TabsTrigger>
                                                <TabsTrigger value="quotes">Quote cancel reasons</TabsTrigger>
                                                <TabsTrigger value="tags">Tags & shipping</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="categories" className="mt-6"><StringListEditor title="Job categories" items={settings.catalogs.jobCategories} onChange={(items) => setSection("catalogs", { ...settings.catalogs, jobCategories: items })} /></TabsContent>
                                            <TabsContent value="sources" className="mt-6"><StringListEditor title="Business sources" items={settings.catalogs.businessSources} onChange={(items) => setSection("catalogs", { ...settings.catalogs, businessSources: items })} /></TabsContent>
                                            <TabsContent value="hold" className="mt-6"><StringListEditor title="Reasons for job on hold" items={settings.catalogs.reasonsOnHold} onChange={(items) => setSection("catalogs", { ...settings.catalogs, reasonsOnHold: items })} /></TabsContent>
                                            <TabsContent value="quotes" className="mt-6"><StringListEditor title="Reasons for cancel quote" items={settings.catalogs.reasonsCancelQuote} onChange={(items) => setSection("catalogs", { ...settings.catalogs, reasonsCancelQuote: items })} /></TabsContent>
                                            <TabsContent value="tags" className="mt-6">
                                                <div className="space-y-4">
                                                    {Object.entries(settings.catalogs.tagsByEntity).map(([entity, tags]) => (
                                                        <StringListEditor key={entity} title={`${entity.charAt(0).toUpperCase()}${entity.slice(1)} tags`} items={tags} onChange={(next) => setSection("catalogs", { ...settings.catalogs, tagsByEntity: { ...settings.catalogs.tagsByEntity, [entity]: next } })} />
                                                    ))}
                                                    <StringListEditor title="Shipping options" items={settings.catalogs.shippingOptions} onChange={(items) => setSection("catalogs", { ...settings.catalogs, shippingOptions: items })} />
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "payments" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Payment methods</CardTitle><CardDescription>Accepted payment methods, POS availability, and default payment term logic.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field label="Default customer payment term"><Input value={settings.payments.defaultCustomerPaymentTerm} onChange={(e) => setSection("payments", { ...settings.payments, defaultCustomerPaymentTerm: e.target.value })} /></Field>
                                            <Field label="Default supplier payment term"><Input value={settings.payments.defaultSupplierPaymentTerm} onChange={(e) => setSection("payments", { ...settings.payments, defaultSupplierPaymentTerm: e.target.value })} /></Field>
                                        </div>
                                        <div className="space-y-3">
                                            {settings.payments.methods.map((method, index) => (
                                                <div key={method.key} className="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1.2fr_120px_120px_120px_120px_120px]">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{method.name}</div>
                                                        <div className="text-xs text-slate-500">{method.type}</div>
                                                    </div>
                                                    <ToggleCompact label="Active" checked={method.active} onChange={(checked) => updatePaymentMethod(index, { ...method, active: checked })} />
                                                    <ToggleCompact label="POS" checked={method.posEnabled} onChange={(checked) => updatePaymentMethod(index, { ...method, posEnabled: checked })} />
                                                    <ToggleCompact label="Fee" checked={method.hasFee} onChange={(checked) => updatePaymentMethod(index, { ...method, hasFee: checked })} />
                                                    <Field label="Amount" className="space-y-1"><Input type="number" value={method.feeAmount} onChange={(e) => updatePaymentMethod(index, { ...method, feeAmount: Number(e.target.value) })} /></Field>
                                                    <Field label="Fee type" className="space-y-1"><Input value={method.feeType} onChange={(e) => updatePaymentMethod(index, { ...method, feeType: e.target.value })} /></Field>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "branding" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Branding & print output</CardTitle><CardDescription>Email branding, barcode defaults, label templates, and visual print controls.</CardDescription></CardHeader>
                                    <CardContent className="grid gap-4 md:grid-cols-2">
                                        <Field label="Logo URL"><Input value={settings.branding.logoUrl} onChange={(e) => setSection("branding", { ...settings.branding, logoUrl: e.target.value })} /></Field>
                                        <Field label="Logo background color"><Input value={settings.branding.logoBgColor} onChange={(e) => setSection("branding", { ...settings.branding, logoBgColor: e.target.value })} /></Field>
                                        <Field label="Logo alignment">
                                            <Select value={settings.branding.logoAlignment} onValueChange={(value: any) => setSection("branding", { ...settings.branding, logoAlignment: value })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Logo position">
                                            <Select value={settings.branding.logoPosition} onValueChange={(value: any) => setSection("branding", { ...settings.branding, logoPosition: value })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent><SelectItem value="top">Top</SelectItem><SelectItem value="middle">Middle</SelectItem></SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="Barcode system"><Input value={settings.branding.barcodeSystem} onChange={(e) => setSection("branding", { ...settings.branding, barcodeSystem: e.target.value })} /></Field>
                                        <Field label="Barcode template"><Input value={settings.branding.barcodeTemplate} onChange={(e) => setSection("branding", { ...settings.branding, barcodeTemplate: e.target.value })} /></Field>
                                        <Field label="Label template"><Input value={settings.branding.labelTemplate} onChange={(e) => setSection("branding", { ...settings.branding, labelTemplate: e.target.value })} /></Field>
                                        <div className="md:col-span-2"><Field label="Email footer"><Textarea rows={4} value={settings.branding.emailFooter} onChange={(e) => setSection("branding", { ...settings.branding, emailFooter: e.target.value })} /></Field></div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "advanced" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Advanced rules</CardTitle><CardDescription>Hidden-but-critical switches for print, workflow, diary defaults and pricing behavior.</CardDescription></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                            <Field label="Quote title"><Input value={settings.advanced.quoteTitle} onChange={(e) => setSection("advanced", { ...settings.advanced, quoteTitle: e.target.value })} /></Field>
                                            <Field label="Odometer unit"><Input value={settings.advanced.defaultOdometerUnit} onChange={(e) => setSection("advanced", { ...settings.advanced, defaultOdometerUnit: e.target.value })} /></Field>
                                            <Field label="Hubodometer unit"><Input value={settings.advanced.defaultHubodometerUnit} onChange={(e) => setSection("advanced", { ...settings.advanced, defaultHubodometerUnit: e.target.value })} /></Field>
                                            <Field label="Default diary view"><Input value={settings.advanced.defaultDiaryView} onChange={(e) => setSection("advanced", { ...settings.advanced, defaultDiaryView: e.target.value })} /></Field>
                                            <Field label="Default booking time"><Input value={settings.advanced.defaultBookingTime} onChange={(e) => setSection("advanced", { ...settings.advanced, defaultBookingTime: e.target.value })} /></Field>
                                            <Field label="Default pickup time"><Input value={settings.advanced.defaultPickupTime} onChange={(e) => setSection("advanced", { ...settings.advanced, defaultPickupTime: e.target.value })} /></Field>
                                            <Field label="SMS workshop name"><Input value={settings.advanced.workshopNameWhenSendSms} onChange={(e) => setSection("advanced", { ...settings.advanced, workshopNameWhenSendSms: e.target.value })} /></Field>
                                            <Field label="Print margins (T/B/L/R)"><Input value={`${settings.advanced.printMarginTop}/${settings.advanced.printMarginBottom}/${settings.advanced.printMarginLeft}/${settings.advanced.printMarginRight}`} readOnly /></Field>
                                        </div>
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {[
                                                ["Show payments on invoice", "showPaymentsOnInvoice"],
                                                ["Print quote price incl. tax", "printQuotePriceIncludeTax"],
                                                ["Print invoice price incl. tax", "printInvoicePriceIncludeTax"],
                                                ["Print GST amount", "printGstAmount"],
                                                ["Print without stock number", "printWithoutStockNumber"],
                                                ["Fit more on invoice", "fitMoreOnInvoice"],
                                                ["Use large logo", "useLargeLogo"],
                                                ["Use full size logo", "useFullSizeLogo"],
                                                ["Auto price update", "automaticPriceUpdate"],
                                                ["Auto cost update", "automaticCostUpdate"],
                                                ["Disable WOF", "disableWof"],
                                                ["Hide finished jobs in diary", "hideFinishedJobsOnDiaryByDefault"],
                                                ["Print payment term on invoice", "printPaymentTermOnInvoice"],
                                                ["Print customer address on job card", "printCustomerAddressOnJobCard"],
                                            ].map(([label, key]) => (
                                                <ToggleRow key={key} label={label} checked={(settings.advanced as any)[key]} onCheckedChange={(checked) => setSection("advanced", { ...settings.advanced, [key]: checked } as any)} />
                                            ))}
                                        </div>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium">Price level names</Label>
                                            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                {settings.advanced.priceLevelNames.map((name, index) => (
                                                    <Input key={index} value={name} onChange={(e) => {
                                                        const next = [...settings.advanced.priceLevelNames];
                                                        next[index] = e.target.value;
                                                        setSection("advanced", { ...settings.advanced, priceLevelNames: next });
                                                    }} />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === "dataTools" && (
                                <Card className={sectionCard}>
                                    <CardHeader><CardTitle>Data tools</CardTitle><CardDescription>Phase-one safe rollout: fully functional exports, guided imports, no open-ended destructive workflows.</CardDescription></CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="export">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="export">Export</TabsTrigger>
                                                <TabsTrigger value="import">Import</TabsTrigger>
                                                <TabsTrigger value="bulkDelete">Bulk Delete</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="export" className="mt-6 space-y-6">
                                                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                                                    <Card className="rounded-xl border border-slate-200"><CardContent className="p-5 space-y-4">
                                                        <p className="text-sm text-slate-600">Select resources to export. Requests run in the background and should notify the workshop when finished.</p>
                                                        <div className="grid gap-3 md:grid-cols-2">
                                                            {exportResources.map((resource) => {
                                                                const checked = settings.dataTools.exportSelections.includes(resource);
                                                                return (
                                                                    <label key={resource} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                                                                        <Checkbox checked={checked} onCheckedChange={(next) => {
                                                                            const values = new Set(settings.dataTools.exportSelections);
                                                                            if (next) values.add(resource); else values.delete(resource);
                                                                            setSection("dataTools", { ...settings.dataTools, exportSelections: Array.from(values) });
                                                                        }} />
                                                                        <span>{resource}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <Field label="Export from date"><Input type="date" value={settings.dataTools.exportFromDate} onChange={(e) => setSection("dataTools", { ...settings.dataTools, exportFromDate: e.target.value })} /></Field>
                                                            <Field label="Format">
                                                                <Select value={settings.dataTools.exportFormat} onValueChange={(value: any) => setSection("dataTools", { ...settings.dataTools, exportFormat: value })}>
                                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                                    <SelectContent><SelectItem value="xlsx">Excel</SelectItem><SelectItem value="csv">CSV</SelectItem></SelectContent>
                                                                </Select>
                                                            </Field>
                                                        </div>
                                                        <Button onClick={requestExport} className="bg-[#123E97] hover:bg-[#0f327c] text-white">Request export</Button>
                                                    </CardContent></Card>
                                                    <Card className="rounded-xl border border-slate-200"><CardContent className="p-5 space-y-4">
                                                        <h3 className="font-semibold text-slate-900">Current request</h3>
                                                        <Badge variant="secondary">{settings.dataTools.currentRequestStatus}</Badge>
                                                        <p className="text-sm text-slate-500">Phase one supports full export and queue/history management from the company side.</p>
                                                    </CardContent></Card>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="import" className="mt-6">
                                                <Card className="rounded-xl border border-slate-200"><CardContent className="p-5 space-y-4">
                                                    <p className="text-sm text-slate-600">Guided import is intentionally limited in phase one to safer datasets such as customers, vehicles, inventory and suppliers.</p>
                                                    <Textarea rows={4} value={settings.dataTools.importNote} onChange={(e) => setSection("dataTools", { ...settings.dataTools, importNote: e.target.value })} />
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary">Customers</Badge>
                                                        <Badge variant="secondary">Vehicles</Badge>
                                                        <Badge variant="secondary">Inventory</Badge>
                                                        <Badge variant="secondary">Suppliers</Badge>
                                                    </div>
                                                </CardContent></Card>
                                            </TabsContent>
                                            <TabsContent value="bulkDelete" className="mt-6">
                                                <Card className="rounded-xl border border-amber-200 bg-amber-50"><CardContent className="p-5 space-y-3">
                                                    <div className="font-semibold text-amber-900">Restricted in phase one</div>
                                                    <p className="text-sm text-amber-800">Bulk delete should remain admin-controlled or hidden until safeguards, previews, and rollback/audit tools are in place.</p>
                                                </CardContent></Card>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </AppLayout>
);

function updateArrayItem<K extends "notifications">(key: K, index: number, value: SettingsShape[K][number]) {
    const next = [...settings[key]] as SettingsShape[K];
    (next as any)[index] = value;
    setSection(key, next);
}

function updateNumbering(index: number, value: SettingsShape["numbering"][number]) {
    const next = [...settings.numbering];
    next[index] = value;
    setSection("numbering", next);
}

function updatePaymentMethod(index: number, value: SettingsShape["payments"]["methods"][number]) {
    const next = [...settings.payments.methods];
    next[index] = value;
    setSection("payments", { ...settings.payments, methods: next });
}
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return <div className={cn("space-y-2", className)}><Label>{label}</Label>{children}</div>;
}

function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

function ToggleCompact({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return <div className="flex flex-col items-center justify-center gap-2 text-sm"><span className="text-xs text-slate-500">{label}</span><Switch checked={checked} onCheckedChange={onChange} /></div>;
}

function StringListEditor({ title, items, onChange }: { title: string; items: string[]; onChange: (items: string[]) => void }) {
    const [draft, setDraft] = useState("");
    return (
        <Card className="rounded-xl border border-slate-200">
            <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <Badge key={item} variant="secondary" className="gap-2 px-3 py-1">
                            {item}
                            <button type="button" onClick={() => onChange(items.filter((entry) => entry !== item))}>×</button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add new value" />
                    <Button type="button" variant="outline" onClick={() => {
                        const trimmed = draft.trim();
                        if (!trimmed || items.includes(trimmed)) return;
                        onChange([...items, trimmed]);
                        setDraft("");
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function deepMerge<T>(base: T, incoming?: Partial<T>): T {
    if (!incoming) return base;
    const output: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
    for (const [key, value] of Object.entries(incoming as any)) {
        if (Array.isArray(value)) output[key] = value;
        else if (value && typeof value === "object") output[key] = deepMerge((output[key] ?? {}) as any, value as any);
        else output[key] = value;
    }
    return output;
}
