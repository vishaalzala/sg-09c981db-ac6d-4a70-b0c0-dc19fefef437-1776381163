import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
    ArrowLeft,
    Mail,
    Printer,
    Loader2,
    CreditCard,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { documentService } from "@/services/documentService";

type Invoice = {
    id: string;
    company_id: string;
    customer_id?: string | null;
    vehicle_id?: string | null;
    invoice_number?: string | null;
    invoice_date?: string | null;
    due_date?: string | null;
    status?: string | null;
    subtotal?: number | null;
    tax_amount?: number | null;
    gst_amount?: number | null;
    total?: number | null;
    total_amount?: number | null;
    amount?: number | null;
    notes?: string | null;
};

type Customer = {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    mobile?: string | null;
};

type Vehicle = {
    id: string;
    registration_number?: string | null;
    make?: string | null;
    model?: string | null;
    year?: string | number | null;
};

type InvoiceItem = {
    id: string;
    description?: string | null;
    quantity?: number | null;
    unit_price?: number | null;
    total?: number | null;
    line_total?: number | null;
};

export default function DashboardInvoiceDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const { toast } = useToast();

    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");

    const [invoice, setInvoice] = useState < Invoice | null > (null);
    const [customer, setCustomer] = useState < Customer | null > (null);
    const [vehicle, setVehicle] = useState < Vehicle | null > (null);
    const [items, setItems] = useState < InvoiceItem[] > ([]);

    const [loading, setLoading] = useState(true);

    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailTo, setEmailTo] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");

    const invoiceId = typeof id === "string" ? id : "";

    const invoiceNumber = useMemo(() => {
        return invoice?.invoice_number || invoice?.id || "Invoice";
    }, [invoice]);

    const invoiceTotal = useMemo(() => {
        return (
            Number(invoice?.total || 0) ||
            Number(invoice?.total_amount || 0) ||
            Number(invoice?.amount || 0)
        );
    }, [invoice]);

    useEffect(() => {
        if (!router.isReady || !invoiceId) return;
        void loadInvoice();
    }, [router.isReady, invoiceId]);

    const loadInvoice = async () => {
        setLoading(true);

        try {
            const company = await companyService.getCurrentCompany();

            if (!company?.id) {
                throw new Error("No company found for current user.");
            }

            setCompanyId(company.id);
            setCompanyName(company.name || "");

            const { data: invoiceRow, error: invoiceError } = await supabase
                .from("invoices")
                .select("*")
                .eq("id", invoiceId)
                .eq("company_id", company.id)
                .single();

            if (invoiceError) throw invoiceError;

            const loadedInvoice = invoiceRow as Invoice;
            setInvoice(loadedInvoice);

            if (loadedInvoice.customer_id) {
                const { data: customerRow } = await supabase
                    .from("customers")
                    .select("id, name, email, phone, mobile")
                    .eq("id", loadedInvoice.customer_id)
                    .eq("company_id", company.id)
                    .maybeSingle();

                setCustomer((customerRow || null) as Customer | null);
            }

            if (loadedInvoice.vehicle_id) {
                const { data: vehicleRow } = await supabase
                    .from("vehicles")
                    .select("id, registration_number, make, model, year")
                    .eq("id", loadedInvoice.vehicle_id)
                    .eq("company_id", company.id)
                    .maybeSingle();

                setVehicle((vehicleRow || null) as Vehicle | null);
            }

            const { data: invoiceItems } = await supabase
                .from("invoice_items")
                .select("*")
                .eq("invoice_id", invoiceId)
                .order("created_at", { ascending: true });

            setItems((invoiceItems || []) as InvoiceItem[]);
        } catch (error: any) {
            toast({
                title: "Could not load invoice",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const openEmailDialog = () => {
        setEmailTo(customer?.email || "");
        setEmailSubject(`Invoice ${invoiceNumber}`);
        setEmailMessage(
            `Hi ${customer?.name || "there"},\n\nPlease find your invoice ${invoiceNumber}.\n\nThank you,\n${companyName || "WorkshopPro"}`
        );
        setShowEmailDialog(true);
    };

    const handleEmailInvoice = async () => {
        if (!invoice || !companyId) {
            toast({
                title: "Invoice not ready",
                description: "Missing invoice or company context.",
                variant: "destructive",
            });
            return;
        }

        if (!emailTo.trim()) {
            toast({
                title: "Recipient required",
                description: "Please enter an email address.",
                variant: "destructive",
            });
            return;
        }

        setSendingEmail(true);

        try {
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData?.user?.id;

            if (!userId) {
                throw new Error("You must be logged in to email this invoice.");
            }

            await documentService.sendDocument(
                companyId,
                "invoice",
                invoice.id,
                "invoice",
                emailTo.trim(),
                userId
            );

            toast({
                title: "Invoice queued",
                description: `Invoice ${invoiceNumber} has been queued for ${emailTo.trim()}.`,
            });

            setShowEmailDialog(false);
        } catch (error: any) {
            toast({
                title: "Could not email invoice",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setSendingEmail(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (value: number | null | undefined) => {
        return new Intl.NumberFormat("en-NZ", {
            style: "currency",
            currency: "NZD",
        }).format(Number(value || 0));
    };

    const formatDate = (value?: string | null) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("en-NZ");
    };

    return (
        <AppLayout companyId={companyId} companyName={companyName}>
            <style jsx global>{`
        @media print {
          aside,
          nav,
          header,
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .print-area {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

            <div className="p-6 space-y-6">
                <div className="no-print flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard/invoices")}
                            className="mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoices
                        </Button>

                        <h1 className="text-3xl font-bold">
                            Invoice {invoiceNumber}
                        </h1>
                        <p className="text-muted-foreground">
                            View invoice details, email customer, or print.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={openEmailDialog} disabled={!invoice}>
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                        </Button>

                        <Button variant="outline" onClick={handlePrint} disabled={!invoice}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>

                        <Button disabled={!invoice}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="flex items-center gap-2 py-10 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading invoice...
                        </CardContent>
                    </Card>
                ) : !invoice ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Invoice not found.
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="print-area">
                        <CardHeader className="border-b">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <CardTitle className="text-2xl">
                                        Invoice {invoiceNumber}
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {companyName || "WorkshopPro"}
                                    </p>
                                </div>

                                <Badge className="w-fit capitalize">
                                    {invoice.status || "draft"}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-8 p-6">
                            <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                    <h3 className="font-semibold">Customer</h3>
                                    <p className="mt-2 text-sm">{customer?.name || "-"}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {customer?.email || "-"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {customer?.mobile || customer?.phone || "-"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold">Vehicle</h3>
                                    <p className="mt-2 text-sm">
                                        {vehicle?.registration_number || "-"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {[vehicle?.year, vehicle?.make, vehicle?.model]
                                            .filter(Boolean)
                                            .join(" ") || "-"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold">Dates</h3>
                                    <p className="mt-2 text-sm">
                                        Invoice date: {formatDate(invoice.invoice_date)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Due date: {formatDate(invoice.due_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">
                                                Description
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Qty
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Unit Price
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-8 text-center text-muted-foreground"
                                                >
                                                    No invoice items found.
                                                </td>
                                            </tr>
                                        ) : (
                                            items.map((item) => (
                                                <tr key={item.id} className="border-t">
                                                    <td className="px-4 py-3">
                                                        {item.description || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {Number(item.quantity || 1)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {formatCurrency(item.unit_price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {formatCurrency(item.total || item.line_total)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full max-w-sm space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(invoice.subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span>GST</span>
                                        <span>
                                            {formatCurrency(invoice.tax_amount || invoice.gst_amount)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(invoiceTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {invoice.notes && (
                                <div>
                                    <h3 className="font-semibold">Notes</h3>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {invoice.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Email Invoice</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>To</Label>
                            <Input
                                type="email"
                                value={emailTo}
                                onChange={(event) => setEmailTo(event.target.value)}
                                placeholder="customer@example.com"
                                disabled={sendingEmail}
                            />
                        </div>

                        <div>
                            <Label>Subject</Label>
                            <Input
                                value={emailSubject}
                                onChange={(event) => setEmailSubject(event.target.value)}
                                disabled={sendingEmail}
                            />
                        </div>

                        <div>
                            <Label>Message</Label>
                            <Textarea
                                rows={5}
                                value={emailMessage}
                                onChange={(event) => setEmailMessage(event.target.value)}
                                disabled={sendingEmail}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowEmailDialog(false)}
                                disabled={sendingEmail}
                            >
                                Cancel
                            </Button>

                            <Button onClick={handleEmailInvoice} disabled={sendingEmail}>
                                {sendingEmail ? "Queuing..." : "Email Invoice"}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            This records the invoice email action now. Real SMTP delivery comes
                            later in Fix 14.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}