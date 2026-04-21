-- Phase 12 scaffold
create table if not exists public.automation_rules (
  id uuid primary key default uuid_generate_v4(),
  rule_key text unique not null,
  name text not null,
  is_enabled boolean not null default false,
  trigger_type text not null,
  conditions jsonb default '{}'::jsonb,
  actions jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default uuid_generate_v4(),
  automation_rule_id uuid references public.automation_rules(id) on delete cascade,
  status text not null default 'queued',
  context jsonb default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_actions (
  id uuid primary key default uuid_generate_v4(),
  automation_run_id uuid references public.automation_runs(id) on delete cascade,
  action_type text not null,
  status text not null default 'pending',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_failures (
  id uuid primary key default uuid_generate_v4(),
  automation_run_id uuid references public.automation_runs(id) on delete cascade,
  action_id uuid references public.automation_actions(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now()
);
