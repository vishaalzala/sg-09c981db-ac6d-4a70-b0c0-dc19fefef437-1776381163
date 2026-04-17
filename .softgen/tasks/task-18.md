---
title: "Enable admin user creation + seed demo users"
status: in_progress
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
- [ ] Audit existing admin panel for user creation capabilities and data sources
- [ ] Add secure API route to create auth user via `supabase.auth.admin.createUser` and upsert linked rows in `profiles` and `users`
- [ ] Enforce authorization: only `super_admin` can call the endpoint (validate access token + role)
- [ ] Add Admin UI: user creation dialog/form (email, password, role, company)
- [ ] Add Admin UI action: “Create demo users” to provision admin/owner/staff/inspector tied to demo company
- [ ] Add validation + error toasts; ensure created users can login immediately
- [ ] Document required env vars for Vercel (`SUPABASE_SERVICE_ROLE_KEY`) without exposing secrets
- [ ] Run `check_for_errors` with build to confirm deploy readiness