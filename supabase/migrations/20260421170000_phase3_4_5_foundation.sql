create extension if not exists "uuid-ossp";

-- ============================================
-- Phase 3: Notifications foundation
-- ============================================
create table if not exists public.notification_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  template_key text not null unique,
  channel text not null default 'email',
  subject text,
  body text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete set null,
  template_id uuid references public.notification_templates(id) on delete set null,
  template_key text,
  channel text not null default 'email',
  recipient text,
  subject text,
  status text not null default 'queued',
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_notification_templates_key on public.notification_templates(template_key);
create index if not exists idx_notification_logs_company on public.notification_logs(company_id);
create index if not exists idx_notification_logs_status on public.notification_logs(status);
create index if not exists idx_notification_logs_created_at on public.notification_logs(created_at desc);

alter table public.notification_templates enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists "super_admin_select_notification_templates" on public.notification_templates;
create policy "super_admin_select_notification_templates" on public.notification_templates for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_notification_templates" on public.notification_templates;
create policy "super_admin_insert_notification_templates" on public.notification_templates for insert with check (public.is_super_admin());
drop policy if exists "super_admin_update_notification_templates" on public.notification_templates;
create policy "super_admin_update_notification_templates" on public.notification_templates for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "super_admin_select_notification_logs" on public.notification_logs;
create policy "super_admin_select_notification_logs" on public.notification_logs for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_notification_logs" on public.notification_logs;
create policy "super_admin_insert_notification_logs" on public.notification_logs for insert with check (public.is_super_admin());
drop policy if exists "super_admin_update_notification_logs" on public.notification_logs;
create policy "super_admin_update_notification_logs" on public.notification_logs for update using (public.is_super_admin()) with check (public.is_super_admin());

insert into public.notification_templates (name, template_key, channel, subject, body, is_active)
values
  ('Welcome Email', 'welcome_email', 'email', 'Welcome to WorkshopPro', 'Welcome to the platform.', true),
  ('Invite Email', 'invite_email', 'email', 'You have been invited', 'Your account invitation is ready.', true),
  ('Trial Ending Reminder', 'trial_ending', 'email', 'Your trial is ending soon', 'Your trial will end soon.', true),
  ('Payment Failed', 'payment_failed', 'email', 'Payment failed', 'Please update your billing details.', true)
on conflict (template_key) do nothing;

-- ============================================
-- Phase 4: Messaging foundation
-- ============================================
create table if not exists public.twilio_numbers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete set null,
  phone_number text not null unique,
  friendly_name text,
  twilio_sid text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sms_conversations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete set null,
  customer_phone text not null,
  twilio_number_id uuid references public.twilio_numbers(id) on delete set null,
  last_message_at timestamptz,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.sms_messages (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references public.companies(id) on delete set null,
  conversation_id uuid references public.sms_conversations(id) on delete set null,
  twilio_number_id uuid references public.twilio_numbers(id) on delete set null,
  from_number text,
  to_number text,
  direction text not null default 'outbound',
  body text,
  status text not null default 'queued',
  twilio_message_sid text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_twilio_numbers_company on public.twilio_numbers(company_id);
create index if not exists idx_sms_conversations_company on public.sms_conversations(company_id);
create index if not exists idx_sms_messages_company on public.sms_messages(company_id);
create index if not exists idx_sms_messages_created_at on public.sms_messages(created_at desc);

alter table public.twilio_numbers enable row level security;
alter table public.sms_conversations enable row level security;
alter table public.sms_messages enable row level security;

drop policy if exists "super_admin_select_twilio_numbers" on public.twilio_numbers;
create policy "super_admin_select_twilio_numbers" on public.twilio_numbers for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_twilio_numbers" on public.twilio_numbers;
create policy "super_admin_insert_twilio_numbers" on public.twilio_numbers for insert with check (public.is_super_admin());
drop policy if exists "super_admin_update_twilio_numbers" on public.twilio_numbers;
create policy "super_admin_update_twilio_numbers" on public.twilio_numbers for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "super_admin_select_sms_conversations" on public.sms_conversations;
create policy "super_admin_select_sms_conversations" on public.sms_conversations for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_sms_conversations" on public.sms_conversations;
create policy "super_admin_insert_sms_conversations" on public.sms_conversations for insert with check (public.is_super_admin());
drop policy if exists "super_admin_update_sms_conversations" on public.sms_conversations;
create policy "super_admin_update_sms_conversations" on public.sms_conversations for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "super_admin_select_sms_messages" on public.sms_messages;
create policy "super_admin_select_sms_messages" on public.sms_messages for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_sms_messages" on public.sms_messages;
create policy "super_admin_insert_sms_messages" on public.sms_messages for insert with check (public.is_super_admin());
drop policy if exists "super_admin_update_sms_messages" on public.sms_messages;
create policy "super_admin_update_sms_messages" on public.sms_messages for update using (public.is_super_admin()) with check (public.is_super_admin());

-- ============================================
-- Phase 5: Leads foundation
-- ============================================
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  company_name text,
  message text,
  source text default 'website',
  status text not null default 'new',
  score integer not null default 0,
  assigned_to uuid references public.users(id) on delete set null,
  converted_company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  activity_type text not null,
  note text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_leads_assigned_to on public.leads(assigned_to);
create index if not exists idx_lead_activities_lead_id on public.lead_activities(lead_id);

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

drop policy if exists "super_admin_select_leads" on public.leads;
create policy "super_admin_select_leads" on public.leads for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_leads" on public.leads;
create policy "super_admin_insert_leads" on public.leads for insert with check (public.is_super_admin());
drop policy if exists "super_admin_update_leads" on public.leads;
create policy "super_admin_update_leads" on public.leads for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "public_insert_leads" on public.leads;
create policy "public_insert_leads" on public.leads for insert to anon, authenticated with check (true);

drop policy if exists "super_admin_select_lead_activities" on public.lead_activities;
create policy "super_admin_select_lead_activities" on public.lead_activities for select using (public.is_super_admin());
drop policy if exists "super_admin_insert_lead_activities" on public.lead_activities;
create policy "super_admin_insert_lead_activities" on public.lead_activities for insert with check (public.is_super_admin());
