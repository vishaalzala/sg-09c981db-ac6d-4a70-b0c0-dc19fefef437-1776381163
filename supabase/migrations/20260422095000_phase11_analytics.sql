-- Phase 11 scaffold
create table if not exists public.report_snapshots (
  id uuid primary key default uuid_generate_v4(),
  report_key text not null,
  snapshot_date date not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
