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
  features: string[];
};

function normalizeFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item)).filter(Boolean);
  }
  if (raw && typeof raw === "object") {
    const values = Object.values(raw as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((item) => String(item))
      .filter(Boolean);
    return values;
  }
  return [];
}

export async function getPublicPlans(): Promise<PublicPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("id, name, display_name, description, price_monthly, price_annual, max_users, max_branches, features, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data || []).map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    display_name: plan.display_name || plan.name,
    description: plan.description || null,
    price_monthly: plan.price_monthly ?? 0,
    price_annual: plan.price_annual ?? 0,
    max_users: plan.max_users ?? null,
    max_branches: plan.max_branches ?? null,
    features: normalizeFeatures(plan.features),
  }));
}
