import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RevenueOpsData } from "@/services/adminService";

export function RevenueOpsPanel({ data }: { data: RevenueOpsData | null }) {
    if (!data) {
        return <div className="text-sm text-muted-foreground">No revenue data available.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Metric title="Active" value={data.summary.active} />
                <Metric title="Trial" value={data.summary.trialing} />
                <Metric title="Past Due" value={data.summary.pastDue} />
                <Metric title="Renewing 14d" value={data.summary.renewingSoon} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subscription Snapshot</CardTitle>
                    <CardDescription>Read-only Stripe foundation view</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.subscriptions.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No subscriptions synced yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.subscriptions.map((subscription) => (
                                <div key={subscription.id} className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">{subscription.companyName || "Unknown company"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {subscription.planName || "No plan"} • {subscription.stripeSubscriptionId || "No Stripe ID"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={subscription.status === "past_due" ? "destructive" : "outline"}>
                                            {subscription.status || "unknown"}
                                        </Badge>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Ends {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "—"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Metric({ title, value }: { title: string; value: number }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
