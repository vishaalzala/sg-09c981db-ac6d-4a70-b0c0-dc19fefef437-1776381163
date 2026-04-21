-- Phase 1: Admin Alerts & Control Center
-- Safe rollout: new table only, no changes to existing business logic

CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  action_url TEXT,
  action_label TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  dismissed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_alerts_severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT admin_alerts_status_check CHECK (status IN ('active', 'resolved', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_admin_alerts_company_id ON public.admin_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON public.admin_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_status ON public.admin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON public.admin_alerts(created_at DESC);

ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_select_admin_alerts" ON public.admin_alerts;
CREATE POLICY "super_admin_select_admin_alerts"
ON public.admin_alerts
FOR SELECT
USING (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_insert_admin_alerts" ON public.admin_alerts;
CREATE POLICY "super_admin_insert_admin_alerts"
ON public.admin_alerts
FOR INSERT
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_update_admin_alerts" ON public.admin_alerts;
CREATE POLICY "super_admin_update_admin_alerts"
ON public.admin_alerts
FOR UPDATE
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_delete_admin_alerts" ON public.admin_alerts;
CREATE POLICY "super_admin_delete_admin_alerts"
ON public.admin_alerts
FOR DELETE
USING (public.is_super_admin());
