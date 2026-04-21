import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Receipt, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueOpsData } from "@/services/adminService";

interface Props {
  data: RevenueOpsData;
}

export function RevenueOpsPanel({ data }: Props) {
  const cards = [
    { label: "Active Subscriptions", value: data.summary.activeSubscriptions, helper: "Current paid / active" },
    { label: "Trials Ending Soon", value: data.summary.trialsEndingSoon, helper: "Within 7 days" },
    { label: "Past Due / Failed", value: data.summary.pastDueSubscriptions, helper: "Needs follow-up" },
    { label: "Renewals Next 14 Days", value: data.summary.renewalsNext14Days, helper: "Read-only forecast" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Foundation Status</CardTitle>
            <CardDescription>Phase 2 is backend-first. Data is visible here before any billing enforcement is turned on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Stripe Secret Key</p>
                <p className="text-sm text-muted-foreground">Server-side only</p>
              </div>
              <Badge variant={data.stripeHealth.secretKeyConfigured ? "default" : "outline"}>
                {data.stripeHealth.secretKeyConfigured ? "Configured" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Webhook Secret</p>
                <p className="text-sm text-muted-foreground">Needed for Stripe event verification</p>
              </div>
              <Badge variant={data.stripeHealth.webhookSecretConfigured ? "default" : "outline"}>
                {data.stripeHealth.webhookSecretConfigured ? "Configured" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Billing Tables</p>
                <p className="text-sm text-muted-foreground">subscriptions + billing_events migration</p>
              </div>
              <Badge variant={data.stripeHealth.tablesReady ? "default" : "outline"}>
                {data.stripeHealth.tablesReady ? "Ready" : "Pending"}
              </Badge>
            </div>
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Safe mode: this page is read-only. It does not block tenants, change plans, or charge customers yet.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phase 2 Quick Checks</CardTitle>
            <CardDescription>What to finish before turning billing on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              {data.stripeHealth.secretKeyConfigured ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />}
              <div>
                <p className="font-medium">Set Stripe environment variables</p>
                <p className="text-muted-foreground">STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on your hosting provider.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Receipt className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Run the Phase 2 SQL migration</p>
                <p className="text-muted-foreground">This creates billing foundation tables only.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Create Stripe products for your plans</p>
                <p className="text-muted-foreground">Map Starter, Growth, Pro before checkout work starts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <RefreshCcw className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Point Stripe webhook to your app</p>
                <p className="text-muted-foreground">Use /api/stripe/webhook after deployment.</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-between" asChild>
              <a href="https://dashboard.stripe.com/test/webhooks" target="_blank" rel="noreferrer">
                Open Stripe webhook setup
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
