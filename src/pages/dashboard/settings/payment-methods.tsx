import { useEffect, useState } from "react";
import { CreditCard, Loader2, Plus, RefreshCw } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";

type PaymentMethod = {
    id: string;
    company_id: string;
    name: string;
    is_active: boolean;
    surcharge_percent: number | null;
    created_at?: string;
    updated_at?: string;
};

const DEFAULT_PAYMENT_METHODS = [
    { name: "Cash", is_active: true, surcharge_percent: 0 },
    { name: "EFTPOS", is_active: true, surcharge_percent: 0 },
    { name: "Credit Card", is_active: true, surcharge_percent: 2 },
    { name: "Bank Transfer", is_active: true, surcharge_percent: 0 },
    { name: "ZIP", is_active: false, surcharge_percent: 0 },
    { name: "Chargeback", is_active: false, surcharge_percent: 0 },
    { name: "Other", is_active: true, surcharge_percent: 0 },
];

export default function PaymentMethodSettings() {
    const { toast } = useToast();

    const [companyId, setCompanyId] = useState < string > ("");
    const [paymentMethods, setPaymentMethods] = useState < PaymentMethod[] > ([]);
    const [loading, setLoading] = useState(true);
    const [savingMethodId, setSavingMethodId] = useState < string | null > (null);
    const [newMethodName, setNewMethodName] = useState("");
    const [adding, setAdding] = useState(false);

    const loadPaymentMethods = async () => {
        setLoading(true);

        try {
            const currentCompanyId = await authService.getCurrentUserCompanyId();

            if (!currentCompanyId) {
                throw new Error("No company found for the current user.");
            }

            setCompanyId(currentCompanyId);

            const { data, error } = await supabase
                .from("payment_methods")
                .select("id, company_id, name, is_active, surcharge_percent, created_at, updated_at")
                .eq("company_id", currentCompanyId)
                .order("created_at", { ascending: true });

            if (error) {
                throw error;
            }

            if (!data || data.length === 0) {
                const now = new Date().toISOString();

                const { data: seededMethods, error: seedError } = await supabase
                    .from("payment_methods")
                    .insert(
                        DEFAULT_PAYMENT_METHODS.map((method) => ({
                            company_id: currentCompanyId,
                            name: method.name,
                            is_active: method.is_active,
                            surcharge_percent: method.surcharge_percent,
                            created_at: now,
                            updated_at: now,
                        }))
                    )
                    .select("id, company_id, name, is_active, surcharge_percent, created_at, updated_at")
                    .order("created_at", { ascending: true });

                if (seedError) {
                    throw seedError;
                }

                setPaymentMethods((seededMethods || []) as PaymentMethod[]);
                return;
            }

            setPaymentMethods(data as PaymentMethod[]);
        } catch (error: any) {
            toast({
                title: "Could not load payment methods",
                description: error?.message || "Please refresh and try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const updatePaymentMethod = async (
        methodId: string,
        changes: Partial<Pick<PaymentMethod, "is_active" | "surcharge_percent" | "name">>
    ) => {
        setSavingMethodId(methodId);

        const previousMethods = paymentMethods;

        setPaymentMethods((current) =>
            current.map((method) =>
                method.id === methodId
                    ? {
                        ...method,
                        ...changes,
                    }
                    : method
            )
        );

        try {
            const { error } = await supabase
                .from("payment_methods")
                .update({
                    ...changes,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", methodId)
                .eq("company_id", companyId);

            if (error) {
                throw error;
            }

            toast({
                title: "Payment method updated",
                description: "Your payment method settings were saved.",
            });
        } catch (error: any) {
            setPaymentMethods(previousMethods);

            toast({
                title: "Could not save payment method",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setSavingMethodId(null);
        }
    };

    const handleToggleActive = async (method: PaymentMethod, checked: boolean) => {
        await updatePaymentMethod(method.id, {
            is_active: checked,
        });
    };

    const handleSurchargeBlur = async (
        method: PaymentMethod,
        value: string
    ) => {
        const surcharge = Number(value);

        if (Number.isNaN(surcharge) || surcharge < 0) {
            toast({
                title: "Invalid surcharge",
                description: "Surcharge must be a positive number.",
                variant: "destructive",
            });
            return;
        }

        if (Number(method.surcharge_percent || 0) === surcharge) {
            return;
        }

        await updatePaymentMethod(method.id, {
            surcharge_percent: surcharge,
        });
    };

    const handleAddPaymentMethod = async () => {
        const name = newMethodName.trim();

        if (!name) {
            toast({
                title: "Name required",
                description: "Enter a payment method name.",
                variant: "destructive",
            });
            return;
        }

        if (!companyId) {
            toast({
                title: "No company found",
                description: "Cannot add payment method without a company.",
                variant: "destructive",
            });
            return;
        }

        setAdding(true);

        try {
            const now = new Date().toISOString();

            const { data, error } = await supabase
                .from("payment_methods")
                .insert({
                    company_id: companyId,
                    name,
                    is_active: true,
                    surcharge_percent: 0,
                    created_at: now,
                    updated_at: now,
                })
                .select("id, company_id, name, is_active, surcharge_percent, created_at, updated_at")
                .single();

            if (error) {
                throw error;
            }

            setPaymentMethods((current) => [...current, data as PaymentMethod]);
            setNewMethodName("");

            toast({
                title: "Payment method added",
                description: `${name} is now available for this company.`,
            });
        } catch (error: any) {
            toast({
                title: "Could not add payment method",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setAdding(false);
        }
    };

    return (
        <AppLayout companyId={companyId}>
            <div className="p-6 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold">
                            Payment Methods
                        </h1>
                        <p className="text-muted-foreground">
                            Configure which payment methods this workshop accepts.
                        </p>
                    </div>

                    <Button variant="outline" onClick={loadPaymentMethods} disabled={loading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Configure Payment Methods
                        </CardTitle>
                        <CardDescription>
                            These settings are saved per company and used when taking invoice
                            payments.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="flex items-center gap-2 py-10 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading payment methods...
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Enabled</TableHead>
                                            <TableHead>Surcharge (%)</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {paymentMethods.map((method) => (
                                            <TableRow key={method.id}>
                                                <TableCell className="font-medium">
                                                    {method.name}
                                                </TableCell>

                                                <TableCell>
                                                    <Switch
                                                        checked={Boolean(method.is_active)}
                                                        disabled={savingMethodId === method.id}
                                                        onCheckedChange={(checked) =>
                                                            handleToggleActive(method, checked)
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        defaultValue={Number(method.surcharge_percent || 0)}
                                                        disabled={savingMethodId === method.id}
                                                        className="w-28"
                                                        onBlur={(event) =>
                                                            handleSurchargeBlur(method, event.target.value)
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {savingMethodId === method.id ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            Saving...
                                                        </span>
                                                    ) : method.is_active ? (
                                                        <span className="text-sm font-medium text-emerald-600">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="rounded-lg border bg-muted/30 p-4">
                                    <Label htmlFor="newPaymentMethod">Add Payment Method</Label>
                                    <div className="mt-2 flex gap-2">
                                        <Input
                                            id="newPaymentMethod"
                                            value={newMethodName}
                                            onChange={(event) => setNewMethodName(event.target.value)}
                                            placeholder="e.g. Afterpay, Finance, Voucher"
                                            disabled={adding}
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddPaymentMethod}
                                            disabled={adding}
                                        >
                                            {adding ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-4 w-4" />
                                            )}
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Gateway Integration</CardTitle>
                        <CardDescription>
                            Stripe and gateway API keys should be managed by the SaaS owner in
                            Admin Settings, not by each workshop.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            Gateway credentials have been moved to{" "}
                            <span className="font-semibold">Super Admin → Settings</span>.
                            This prevents workshops from accidentally changing platform-wide
                            billing keys.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}