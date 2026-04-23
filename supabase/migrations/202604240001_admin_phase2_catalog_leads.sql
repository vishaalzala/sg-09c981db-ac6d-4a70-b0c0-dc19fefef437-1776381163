-- WorkshopPro Admin Phase 2 catalog + leads hardening
-- Safe/idempotent migration for plan visibility, add-on visibility, lifecycle fields, and leads admin.

alter table if exists public.subscription_plans
  add column if not exists trial_days integer default 14,
  add column if not exists is_public boolean default true,
  add column if not exists show_on_homepage boolean default true,
  add column if not exists show_on_pricing boolean default true,
  add column if not exists sort_order integer default 100,
  add column if not exists features jsonb default '[]'::jsonb,
  add column if not exists updated_at timestamptz default now();

alter table if exists public.addon_catalog
  add column if not exists is_active boolean default true,
  add column if not exists is_public boolean default false,
  add column if not exists is_available_for_signup boolean default false,
  add column if not exists internal_only boolean default false,
  add column if not exists sort_order integer default 100,
  add column if not exists updated_at timestamptz default now();

alter table if exists public.company_subscriptions
  add column if not exists billing_cycle text default 'monthly',
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists cancel_at_period_end boolean default false,
  add column if not exists paused_at timestamptz,
  add column if not exists resumes_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table if exists public.company_addons
  add column if not exists is_enabled boolean default true,
  add column if not exists enabled_at timestamptz,
  add column if not exists disabled_at timestamptz,
  add column if not exists updated_at timestamptz default now();

create unique index if not exists company_addons_company_addon_unique
  on public.company_addons(company_id, addon_id);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company_name text,
  message text,
  source text default 'contact_form',
  status text default 'new',
  assigned_to uuid,
  converted_company_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_email_idx on public.leads(email);

alter table if exists public.audit_logs
  add column if not exists company_id uuid,
  add column if not exists metadata jsonb default '{}'::jsonb;
