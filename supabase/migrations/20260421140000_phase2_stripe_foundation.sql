-- Phase 2: Stripe Foundation (safe mode)
-- New tables only. No plan enforcement, no user blocking.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT,
  plan_name TEXT,
  status TEXT NOT NULL DEFAULT 'incomplete',
  billing_interval TEXT,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'nzd',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  trial_end TIMESTAMPTZ,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_event_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received',
  payload JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_billing_events_company_id ON public.billing_events(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON public.billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON public.billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON public.billing_events(created_at DESC);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_select_subscriptions" ON public.subscriptions;
CREATE POLICY "super_admin_select_subscriptions" ON public.subscriptions FOR SELECT USING (public.is_super_admin());
DROP POLICY IF EXISTS "super_admin_insert_subscriptions" ON public.subscriptions;
CREATE POLICY "super_admin_insert_subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (public.is_super_admin());
DROP POLICY IF EXISTS "super_admin_update_subscriptions" ON public.subscriptions;
CREATE POLICY "super_admin_update_subscriptions" ON public.subscriptions FOR UPDATE USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
DROP POLICY IF EXISTS "company_select_own_subscriptions" ON public.subscriptions;
CREATE POLICY "company_select_own_subscriptions" ON public.subscriptions FOR SELECT USING (company_id = public.current_user_company_id());

DROP POLICY IF EXISTS "super_admin_select_billing_events" ON public.billing_events;
CREATE POLICY "super_admin_select_billing_events" ON public.billing_events FOR SELECT USING (public.is_super_admin());
DROP POLICY IF EXISTS "super_admin_insert_billing_events" ON public.billing_events;
CREATE POLICY "super_admin_insert_billing_events" ON public.billing_events FOR INSERT WITH CHECK (public.is_super_admin());
DROP POLICY IF EXISTS "super_admin_update_billing_events" ON public.billing_events;
CREATE POLICY "super_admin_update_billing_events" ON public.billing_events FOR UPDATE USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
