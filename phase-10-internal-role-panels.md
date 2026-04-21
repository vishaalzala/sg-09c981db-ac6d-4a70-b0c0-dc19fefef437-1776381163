# Phase 10 — Internal Role Panels

## Goal
Separate internal staff access by function.

## Roles
- super_admin
- sales_admin
- billing_admin
- support_admin
- ops_admin
- executive_readonly

## Scope
- menu filtering by internal role
- admin policy helpers
- role assignment UI
- scoped pages for each role

## Suggested DB
- `internal_roles`
- `internal_role_permissions`
- `admin_staff_assignments`

## Safety
- default deny
- audit every role change
