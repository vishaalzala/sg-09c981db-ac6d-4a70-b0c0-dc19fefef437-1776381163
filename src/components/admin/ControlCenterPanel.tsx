import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Building2, Clock, RefreshCw, Users } from "lucide-react";
import Link from "next/link";
import type { ControlCenterData } from "@/services/adminService";

const severityVariant = {
    low: "secondary",
    medium: "outline",
    high: "destructive",
    critical: "destructive",
} as const;

export function ControlCenterPanel({ data, onRefresh }: { data: ControlCenterData | null; onRefresh?: () => void }) {
    if (!data) {
        return <div className="text-sm text-muted-foreground">No control center data available.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalAlerts}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Trials Ending Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.trialsEndingSoon}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.inactiveCompanies}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Onboarding Incomplete</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.onboardingIncomplete}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Alerts</CardTitle>
                            <CardDescription>Live signals from existing platform data</CardDescription>
                        </div>
                        {onRefresh && (
                            <Button variant="outline" size="sm" onClick={onRefresh}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {data.alerts.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No active alerts right now.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.alerts.map((alert) => (
                                    <div key={alert.id} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                <p className="font-medium">{alert.title}</p>
                                            </div>
                                            <Badge variant={severityVariant[alert.severity]}>{alert.severity}</Badge>
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">{alert.message}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            {alert.companyName && (
                                                <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{alert.companyName}</span>
                                            )}
                                            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(alert.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Owner shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin?tab=revenue" className="block">
                            <Button variant="outline" className="w-full justify-between">
                                Review renewals
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/admin?tab=companies" className="block">
                            <Button variant="outline" className="w-full justify-between">
                                Open companies
                                <Building2 className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/admin?tab=users" className="block">
                            <Button variant="outline" className="w-full justify-between">
                                Review users
                                <Users className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/admin?tab=leads" className="block">
                            <Button className="w-full justify-between">
                                New leads queue
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
