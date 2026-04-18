import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { useRouter } from "next/router";

interface TrialStatus {
  daysRemaining: number;
  status: "trial_active" | "trial_expired" | "active";
  planName: string;
}

export function TrialBanner() {
  const router = useRouter();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrialStatus();
  }, []);

  const loadTrialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from("users")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!userData?.company_id) return;

      const { data: subscription } = await supabase
        .from("company_subscriptions")
        .select("*, plan:subscription_plans(name)")
        .eq("company_id", userData.company_id)
        .single();

      if (subscription && subscription.status === "trial_active" && subscription.trial_end) {
        const trialEnd = new Date(subscription.trial_end);
        const now = new Date();
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setTrialStatus({
          daysRemaining: Math.max(0, daysRemaining),
          status: subscription.status,
          planName: subscription.plan?.name || "Free Trial"
        });
      } else if (subscription?.status === "trial_expired") {
        setTrialStatus({
          daysRemaining: 0,
          status: "trial_expired",
          planName: subscription.plan?.name || "Free Trial"
        });
      }
    } catch (error) {
      console.error("Error loading trial status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trialStatus) return null;

  if (trialStatus.status === "trial_expired") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Your free trial has expired. Please upgrade to continue using WorkshopPro.</span>
          <Button size="sm" variant="outline" onClick={() => router.push("/billing")}>
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (trialStatus.status === "trial_active" && trialStatus.daysRemaining <= 3) {
    return (
      <Alert className="mb-4 border-amber-500 bg-amber-50">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex items-center justify-between text-amber-800">
          <span>
            {trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? "s" : ""} remaining in your free trial
          </span>
          <Button size="sm" variant="outline" onClick={() => router.push("/billing")}>
            View Plans
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}