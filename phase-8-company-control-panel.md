# Phase 8 — Company Control Panel

## Goal
Give super admin tenant operations tools.

## Scope
- company health card
- impersonation request flow
- suspend/reactivate
- billing lock toggle
- onboarding reset
- force logout all users
- export company data request

## Suggested DB
- `company_admin_actions`
- `tenant_locks`
- `impersonation_sessions`

## Safety
- require confirmation for destructive actions
- full audit trail
- use soft-lock, not delete
