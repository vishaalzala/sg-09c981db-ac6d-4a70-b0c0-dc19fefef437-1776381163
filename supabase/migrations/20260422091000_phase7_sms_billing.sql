-- Phase 7 scaffold
create table if not exists public.sms_usage_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  sms_message_id uuid,
  direction text not null default 'outbound',
  segments integer not null default 1,
  estimated_cost numeric(12,4),
  provider text default 'twilio',
  sent_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.usage_meters (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  meter_key text not null,
  period_start date not null,
  period_end date not null,
  quantity numeric(12,2) not null default 0,
  amount_estimated numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists public.sms_billing_summaries (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete cascade,
  billing_month date not null,
  included_credits integer default 0,
  used_segments integer default 0,
  billable_segments integer default 0,
  estimated_amount numeric(12,2) default 0,
  created_at timestamptz not null default now()
);
