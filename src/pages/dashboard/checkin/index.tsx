import { useEffect, useMemo, useState } from "react";
import { Link as LinkIcon, Copy, ExternalLink } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";

export default function DashboardCheckInLinkPage() {
    const { toast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [companyId, setCompanyId] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        void loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            setLoading(true);

            const company = await companyService.getCurrentCompany();

            if (!company?.id) {
                throw new Error("No company found.");
            }

            setCompanyId(company.id);
            setCompanyName(company.name || "");
        } catch (error: any) {
            toast({
                title: "Could not load company",
                description: error?.message || "Please refresh and try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const checkInUrl = useMemo(() => {
        if (!mounted || !companyId) return "";

        return `${window.location.origin}/checkin?companyId=${companyId}`;
    }, [mounted, companyId]);

    const copyLink = async () => {
        if (!checkInUrl) return;

        await navigator.clipboard.writeText(checkInUrl);

        toast({
            title: "Copied",
            description: "Check-in kiosk link copied.",
        });
    };

    return (
        <AppLayout companyId={companyId} companyName={companyName}>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Customer Check-In</h1>
                    <p className="text-muted-foreground">
                        Share this public kiosk link with customers or open it on a workshop tablet.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LinkIcon className="h-5 w-5" />
                            Public Check-In Link
                        </CardTitle>
                        <CardDescription>
                            This page is for company users. The actual customer check-in page stays public at `/checkin`.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading company...</p>
                        ) : !checkInUrl ? (
                            <p className="text-sm text-destructive">
                                Could not generate check-in link.
                            </p>
                        ) : (
                            <>
                                <Input value={checkInUrl} readOnly />

                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={copyLink}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Link
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(checkInUrl, "_blank")}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Check-In Page
                                    </Button>
                                </div>

                                <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-600">
                                    Later we can add a QR code here, but it must be rendered client-side only to avoid hydration errors.
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}