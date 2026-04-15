import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Package, TrendingUp, Lock, Check } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { companyService } from "@/services/companyService";
import { billingService } from "@/services/billingService";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const [companyId, setCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [usageRecords, setUsageRecords] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const company = await companyService.getCurrentCompany();
    if (company) {
      setCompanyId(company.id);
      const [subData, addonData, catalogData, usageData] = await Promise.all([
        billingService.getCompanySubscription(company.id),
        billingService.getCompanyAddons(company.id),
        billingService.getAddonCatalog(),
        billingService.getUsageRecords(company.id),
      ]);
      setSubscription(subData);
      setAddons(addonData);
      setAvailableAddons(catalogData);
      setUsageRecords(usageData.slice(0, 50));
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const plan = Array.isArray(subscription?.plan) ? subscription.plan[0] : subscription?.plan;
  const enabledAddonIds = addons.map(a => Array.isArray(a.addon) ? a.addon[0]?.id : a.addon?.id);

  return (
    <AppLayout companyId={companyId} companyName="AutoTech Workshop" userName="Account Owner">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold">Billing & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plan and add-ons
          </p>
        </div>

        {/* Current Plan */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                {plan?.name || "No Active Plan"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Price</span>
                  <span className="text-2xl font-bold">${plan.monthly_price?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Users Included</span>
                  <span className="font-semibold">{plan.max_users || "Unlimited"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Renewal Date</span>
                  <span className="font-semibold">
                    {subscription?.billing_cycle_end ? new Date(subscription.billing_cycle_end).toLocaleDateString() : "—"}
                  </span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Change Plan
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="addons" className="space-y-4">
          <TabsList>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
            <TabsTrigger value="usage">Usage & Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="addons" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableAddons.map((addon) => {
                const isEnabled = enabledAddonIds.includes(addon.id);

                return (
                  <Card key={addon.id} className={cn(
                    "relative",
                    isEnabled && "border-primary bg-primary/5"
                  )}>
                    {isEnabled && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-success text-success-foreground">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{addon.name}</CardTitle>
                          <CardDescription>{addon.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${addon.monthly_price?.toFixed(2)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {addon.usage_based_pricing && (
                        <p className="text-sm text-muted-foreground">
                          + usage charges apply
                        </p>
                      )}
                      <Button
                        className="w-full"
                        variant={isEnabled ? "outline" : "default"}
                        disabled={isEnabled}
                      >
                        {isEnabled ? "Enabled" : "Enable Add-on"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Records</CardTitle>
                <CardDescription>Recent metered usage and charges</CardDescription>
              </CardHeader>
              <CardContent>
                {usageRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No usage records</p>
                ) : (
                  <div className="space-y-2">
                    {usageRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{record.feature_slug}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${record.cost?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {record.quantity || 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}