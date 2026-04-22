import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { DocumentBuilder } from "@/components/DocumentBuilder";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewInvoice() {
    const router = useRouter();
    const [companyId, setCompanyId] = useState < string > ("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState < string | null > (null);

    useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) {
                console.error("Auth error:", authError);
                setError("Authentication error. Please log in again.");
                setLoading(false);
                return;
            }

            if (!user) {
                router.push("/login");
                return;
            }

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("company_id")
                .eq("id", user.id)
                .single();

            if (userError) {
                console.error("Error loading user data:", userError);
                setError("Failed to load user data. Please contact support.");
                setLoading(false);
                return;
            }

            if (!userData?.company_id) {
                setError("No company context found. Please contact support.");
                setLoading(false);
                return;
            }

            setCompanyId(userData.company_id);
            setLoading(false);
        } catch (err) {
            console.error("Error loading company:", err);
            setError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    const handleComplete = () => {
        router.push("/dashboard/invoices");
    };

    return (
        <AppLayout companyId={companyId}>
            <div className="p-6">
                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                            <p className="text-muted-foreground">Loading new invoice...</p>
                        </div>
                    </div>
                ) : error || !companyId ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Card className="w-full max-w-md">
                            <CardContent className="pt-6 text-center">
                                <p className="mb-4 text-destructive">
                                    {error || "No company found. Please set up your company first."}
                                </p>
                                <Button onClick={() => router.push("/dashboard/invoices")}>
                                    Back to Invoices
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <DocumentBuilder
                        type="invoice"
                        companyId={companyId}
                        onComplete={handleComplete}
                    />
                )}
            </div>
        </AppLayout>
    );
}