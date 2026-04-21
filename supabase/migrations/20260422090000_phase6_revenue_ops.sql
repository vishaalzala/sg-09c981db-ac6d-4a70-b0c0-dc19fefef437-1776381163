-- Phase 6 scaffold
create table if not exists public.revenue_ops_notes (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  note text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_overrides (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  override_type text not null,
  override_value jsonb default '{}'::jsonb,
  status text not null default 'active',
  created_by uuid,
  created_at timestamptz not null default now()
);
