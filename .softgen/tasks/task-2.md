---
title: Authentication and RBAC system
status: done
priority: urgent
type: feature
tags:
- auth
- security
- backend
created_by: agent
created_at: 2026-04-15 22:51:04+00:00
position: 2
---

## Notes
Implement Supabase Auth with custom user management and role-based access control. Support 11 different user roles with granular permissions for multi-tenant environment.

User roles: Super Admin, Internal Sales/Admin Ops, Company Owner, Branch Manager, Service Advisor, Technician, Parts Manager, WOF Inspector, Accountant/Finance, Reception/Front Desk, Customer Portal User

## Checklist
- [x] Set up Supabase Auth with email/password authentication
- [x] Create user profile sync trigger for new auth users
- [x] Build authService with login, logout, session management, role checking
- [x] Create permissionService for RBAC checks (canAccessWOF, canManageInventory, canApproveQuotes, etc.)
- [x] Build role assignment UI for company owners to manage user roles
- [x] Create middleware/hooks for protecting routes by role
- [x] Add company_id validation on all user operations
- [x] Build user management page with role assignment and branch assignment
