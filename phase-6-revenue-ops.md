# Phase 6 — Revenue Ops Active

## Goal
Use Stripe data operationally without blocking tenant features.

## Scope
- Revenue Ops admin UI
- trial ending queue
- renewals in next 14 days
- failed payments / past due
- admin actions: extend trial, mark for follow-up, open company

## Suggested DB
- use existing `subscriptions`
- use existing `billing_events`
- add `revenue_ops_notes`
- add `subscription_overrides`

## Admin tabs
- Trials
- Renewals
- Failed Payments
- Overdue
- Notes

## Safety
- No tenant blocking
- No enforced hard locks yet
- Admin-only controls
