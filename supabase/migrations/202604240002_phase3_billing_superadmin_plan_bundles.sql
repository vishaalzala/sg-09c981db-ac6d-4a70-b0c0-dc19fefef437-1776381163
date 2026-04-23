-- Phase 3: plan bundles, subscription lifecycle, super-admin action support

create table if not exists public.plan_addons (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  addon_id uuid not null references public.addon_catalog(id) on delete cascade,
  is_included boolean not null default true,
  created_at timestamptz not null default now(),
  unique(plan_id, addon_id)
);

alter table public.company_subscriptions add column if not exists paused_at timestamptz;
alter table public.company_subscriptions add column if not exists resumes_at timestamptz;
alter table public.company_subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.company_subscriptions add column if not exists next_billing_date timestamptz;
alter table public.company_subscriptions add column if not exists current_period_start timestamptz;
alter table public.company_subscriptions add column if not exists current_period_end timestamptz;

alter table public.company_addons add column if not exists source text not null default 'manual';
alter table public.company_addons add column if not exists price_override numeric;
alter table public.company_addons add column if not exists expires_at timestamptz;

create table if not exists public.subscription_adjustments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid references public.company_subscriptions(id) on delete set null,
  adjustment_type text not null,
  amount numeric not null default 0,
  currency text not null default 'NZD',
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.dunning_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  subscription_id uuid references public.company_subscriptions(id) on delete set null,
  stage text not null default 'payment_failed',
  status text not null default 'pending',
  next_action_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_action_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  action_type text not null,
  reason text,
  status text not null default 'completed',
  requested_by uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.communication_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_type text not null,
  channel text not null default 'email',
  template_id uuid references public.communication_templates(id) on delete set null,
  delay_minutes integer not null default 0,
  is_active boolean not null default true,
  conditions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.communication_queue (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  rule_id uuid references public.communication_rules(id) on delete set null,
  template_id uuid references public.communication_templates(id) on delete set null,
  recipient text not null,
  channel text not null default 'email',
  status text not null default 'pending',
  scheduled_for timestamptz not null default now(),
  attempts integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_plan_addons_plan_id on public.plan_addons(plan_id);
create index if not exists idx_plan_addons_addon_id on public.plan_addons(addon_id);
create index if not exists idx_company_subscriptions_status on public.company_subscriptions(status);
create index if not exists idx_dunning_runs_company on public.dunning_runs(company_id, status);
create index if not exists idx_communication_queue_due on public.communication_queue(status, scheduled_for);
