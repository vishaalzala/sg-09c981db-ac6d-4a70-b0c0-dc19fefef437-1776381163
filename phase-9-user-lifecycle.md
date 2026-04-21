# Phase 9 — User Lifecycle Ops

## Goal
Support full internal admin user operations.

## Scope
- resend invite
- deactivate/reactivate
- lock/unlock
- force logout
- MFA status view
- last login / failed login history
- move user between companies (admin tool)

## Suggested DB
- `user_admin_actions`
- `auth_event_logs`
- `user_transfer_requests`

## Safety
- role checks
- action confirmations
- audit trail
