-- Phase 8 scaffold
create table if not exists public.company_admin_actions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  action_type text not null,
  action_payload jsonb default '{}'::jsonb,
  performed_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_locks (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  lock_type text not null,
  reason text,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.impersonation_sessions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  target_user_id uuid,
  initiated_by uuid,
  approved_by uuid,
  status text not null default 'requested',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
