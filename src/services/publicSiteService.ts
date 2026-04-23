import { supabase } from "@/integrations/supabase/client";

export type PublicPlan = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_monthly: number | null;
  price_annual: number | null;
  max_users: number | null;
  max_branches: number | null;
  trial_days?: number | null;
  features: string[];
  is_active?: boolean;
  is_public?: boolean;
  show_on_homepage?: boolean;
  show_on_pricing?: boolean;
  sort_order?: number | null;
};

function normalizeFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (item === null || item === undefined) return "";
        if (typeof item === "object") return Object.values(item as Record<string, unknown>).filter(Boolean).join(" ");
        return String(item);
      })
      .map((item) => item.trim())
      .filter((item) => item && item !== "null" && item !== "undefined" && item !== "true" && item !== "false");
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .flatMap(([key, value]) => {
        if (value === true) return [key];
        if (value === false || value == null) return [];
        if (Array.isArray(value)) return value.map(String);
        return [`${key}: ${String(value)}`];
      })
      .map((item) => item.trim())
      .filter((item) => item && item !== "null" && item !== "undefined" && item !== "true" && item !== "false");
  }
  return [];
}

function normalizePlan(plan: any): PublicPlan {
  return {
    id: plan.id,
    name: plan.name,
    display_name: plan.display_name || plan.name,
    description: plan.description || null,
    price_monthly: plan.price_monthly ?? 0,
    price_annual: plan.price_annual ?? 0,
    max_users: plan.max_users ?? null,
    max_branches: plan.max_branches ?? null,
    trial_days: plan.trial_days ?? 14,
    features: normalizeFeatures(plan.features),
    is_active: plan.is_active !== false,
    is_public: plan.is_public !== false,
    show_on_homepage: plan.show_on_homepage !== false,
    show_on_pricing: plan.show_on_pricing !== false,
    sort_order: plan.sort_order ?? 100,
  };
}

export async function getPublicPlans(options?: { placement?: "homepage" | "pricing" | "signup" }): Promise<PublicPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data || [])
    .map(normalizePlan)
    .filter((plan) => plan.is_active !== false && plan.is_public !== false)
    .filter((plan) => {
      if (options?.placement === "homepage") return plan.show_on_homepage !== false;
      if (options?.placement === "pricing") return plan.show_on_pricing !== false;
      return true;
    });
}
