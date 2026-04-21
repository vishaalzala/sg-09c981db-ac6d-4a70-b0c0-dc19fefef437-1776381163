create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  settings_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id)
);

create table if not exists public.company_data_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  request_type text not null check (request_type in ('export','import','bulk_delete')),
  status text not null default 'queued' check (status in ('queued','processing','finished','failed','cancelled')),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid null references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_company_settings_company on public.company_settings(company_id);
create index if not exists idx_company_data_requests_company on public.company_data_requests(company_id);
create index if not exists idx_company_data_requests_status on public.company_data_requests(status);

alter table public.company_settings enable row level security;
alter table public.company_data_requests enable row level security;

drop policy if exists "company_settings_select_own" on public.company_settings;
create policy "company_settings_select_own"
on public.company_settings for select
using (company_id = public.get_user_company_id() or public.is_super_admin());

drop policy if exists "company_settings_insert_own" on public.company_settings;
create policy "company_settings_insert_own"
on public.company_settings for insert
with check (company_id = public.get_user_company_id() or public.is_super_admin());

drop policy if exists "company_settings_update_own" on public.company_settings;
create policy "company_settings_update_own"
on public.company_settings for update
using (company_id = public.get_user_company_id() or public.is_super_admin())
with check (company_id = public.get_user_company_id() or public.is_super_admin());

drop policy if exists "company_data_requests_select_own" on public.company_data_requests;
create policy "company_data_requests_select_own"
on public.company_data_requests for select
using (company_id = public.get_user_company_id() or public.is_super_admin());

drop policy if exists "company_data_requests_insert_own" on public.company_data_requests;
create policy "company_data_requests_insert_own"
on public.company_data_requests for insert
with check (company_id = public.get_user_company_id() or public.is_super_admin());

drop policy if exists "company_data_requests_update_own" on public.company_data_requests;
create policy "company_data_requests_update_own"
on public.company_data_requests for update
using (company_id = public.get_user_company_id() or public.is_super_admin())
with check (company_id = public.get_user_company_id() or public.is_super_admin());
