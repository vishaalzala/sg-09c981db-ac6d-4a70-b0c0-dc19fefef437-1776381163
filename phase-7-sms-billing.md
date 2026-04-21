# Phase 7 — SMS Billing

## Goal
Track SMS usage and prepare Stripe metered/overage billing.

## Scope
- track sent SMS count and cost
- monthly usage aggregation by company
- included credits by plan
- projected overage

## Suggested DB
- `sms_usage_logs`
- `usage_meters`
- `sms_billing_summaries`

## Admin views
- Usage by company
- Estimated monthly charges
- Included vs overage

## Safety
- Read-only calculations first
- invoice/push-to-stripe step only after validation
