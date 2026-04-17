---
title: "Enable admin user creation + seed demo users"
status: done
priority: urgent
type: feature
tags: ["admin", "auth", "supabase", "demo"]
created_by: agent
created_at: 2026-04-17
position: 18
---

## Notes
Implement Super Admin ability to create users from the Admin panel, with role + company assignment, backed by a secure Next.js API route using Supabase service role key. Also add an admin-only action to seed the 4 required demo users for live testing. Must not change overall architecture; integrate with existing Admin panel + AuthContext.

## Checklist
- [x] Audit existing admin panel for user creation capabilities and data sources
- [x] Add secure API routes using Supabase service role key (create user, seed demo users, list companies)
- [x] Enforce authorization: only `super_admin` can call the endpoint (validate access token + role)
- [x] Add Admin UI: user creation dialog/form (email, password, role, company)
- [x] Add Admin UI action: “Create demo users” to provision admin/owner/staff/inspector tied to demo company
- [x] Add “bootstrap first super admin” flow (no dashboard, no SQL)
- [x] Add validation + error toasts; ensure created users can login immediately
- [x] Document required env vars for Vercel (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_BOOTSTRAP_TOKEN`) without exposing secrets
- [x] Run `check_for_errors` with build to confirm deploy readiness