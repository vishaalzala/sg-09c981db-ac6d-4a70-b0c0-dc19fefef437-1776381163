-- Fix add-on activation support.
-- The app now toggles add-ons through server API routes using SUPABASE_SERVICE_ROLE_KEY.
-- This migration only ensures the expected optional columns/index exist.

alter table if exists public.company_addons
  add column if not exists is_enabled boolean default true,
  add column if not exists enabled_at timestamptz,
  add column if not exists disabled_at timestamptz;

create unique index if not exists company_addons_company_addon_unique
  on public.company_addons(company_id, addon_id);
