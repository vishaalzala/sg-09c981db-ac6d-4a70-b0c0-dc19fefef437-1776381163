-- Phase 10 scaffold
create table if not exists public.internal_roles (
  id uuid primary key default uuid_generate_v4(),
  role_key text unique not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.internal_role_permissions (
  id uuid primary key default uuid_generate_v4(),
  internal_role_id uuid references public.internal_roles(id) on delete cascade,
  permission_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_staff_assignments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  internal_role_id uuid references public.internal_roles(id) on delete cascade,
  assigned_by uuid,
  created_at timestamptz not null default now()
);
