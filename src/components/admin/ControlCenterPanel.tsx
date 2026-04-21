import { AlertTriangle, ArrowRight, Building2, Clock, UserX, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ControlCenterData } from "@/services/adminService";

interface Props {
    data: ControlCenterData;
}

const severityVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    critical: "destructive",
};

const iconMap: Record<string, any> = {
    trial_ending: Clock,
    inactive_company: Building2,
    no_users_created: Users,
    onboarding_incomplete: UserX,
};

export function ControlCenterPanel({ data }: Props) {
    const summary = [
        { label: "Active Alerts", value: data.summary.totalAlerts, helper: "Needs review now" },
        { label: "High Priority", value: data.summary.highPriorityAlerts, helper: "Action today" },
        { label: "Trials Ending", value: data.summary.trialsEndingSoon, helper: "Next 7 days" },
        { label: "Inactive Companies", value: data.summary.inactiveCompanies, helper: "No login 7+ days" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summary.map((item) => (
                    <Card key={item.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{item.helper}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>Alerts & Action Queue</CardTitle>
                        <CardDescription>Safe Phase 1 alerts using existing website data only.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.alerts.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No alerts right now. Platform looks healthy.
                            </div>
                        ) : (
                            data.alerts.map((alert) => {
                                const Icon = iconMap[alert.alert_type] || AlertTriangle;
                                return (
                                    <div key={alert.id} className="rounded-lg border p-4 flex items-start justify-between gap-4">
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 rounded-md bg-muted p-2">
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium">{alert.title}</p>
                                                    <Badge variant={severityVariant[alert.severity] || "outline"}>{alert.severity}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                                {alert.company_name && (
                                                    <p className="text-xs text-muted-foreground mt-2">Company: {alert.company_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        {alert.action_url && alert.action_label ? (
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={alert.action_url}>
                                                    {alert.action_label}
                                                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        ) : null}
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Fast admin actions without changing live website flows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild variant="outline" className="w-full justify-between">
                            <Link href="/admin?tab=companies">Review companies <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-between">
                            <Link href="/admin?tab=users">Review users <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-between">
                            <Link href="/admin?tab=revenue">Open Revenue Ops <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                            Phase 1 is read-only intelligence. No quotes, jobs, invoices, reminders, or customer flows are changed.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
