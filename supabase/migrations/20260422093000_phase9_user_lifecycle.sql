-- Phase 9 scaffold
create table if not exists public.user_admin_actions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  action_type text not null,
  action_payload jsonb default '{}'::jsonb,
  performed_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_event_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_transfer_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  from_company_id uuid references public.companies(id) on delete set null,
  to_company_id uuid references public.companies(id) on delete set null,
  status text not null default 'pending',
  created_by uuid,
  created_at timestamptz not null default now()
);
