---
title: Authentication and RBAC system
status: todo
priority: urgent
type: feature
tags: [auth, security, backend]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 2
---

## Notes
Implement Supabase Auth with custom user management and role-based access control. Support 11 different user roles with granular permissions for multi-tenant environment.

User roles: Super Admin, Internal Sales/Admin Ops, Company Owner, Branch Manager, Service Advisor, Technician, Parts Manager, WOF Inspector, Accountant/Finance, Reception/Front Desk, Customer Portal User

## Checklist
- [ ] Set up Supabase Auth with email/password authentication
- [ ] Create user profile sync trigger for new auth users
- [ ] Build authService with login, logout, session management, role checking
- [ ] Create permissionService for RBAC checks (canAccessWOF, canManageInventory, canApproveQuotes, etc.)
- [ ] Build role assignment UI for company owners to manage user roles
- [ ] Create middleware/hooks for protecting routes by role
- [ ] Add company_id validation on all user operations
- [ ] Build user management page with role assignment and branch assignment