# Phase 2 Upload Steps

This patch is cumulative: it includes **Phase 1 + Phase 2** admin additions.

## What this patch adds
- Control Center (Phase 1)
- Revenue Ops read-only page (Phase 2)
- Stripe foundation API routes
- Stripe foundation DB migrations

## Step 1: Upload project files
Replace your project with the contents of this zip, or merge the changed files into your existing project.

## Step 2: Run SQL migrations in Supabase
Run these two files in Supabase SQL Editor, one at a time:

1. `supabase/migrations/20260421123000_admin_alerts_phase1.sql`
2. `supabase/migrations/20260421140000_phase2_stripe_foundation.sql`

If `uuid_generate_v4()` errors, run first:

```sql
create extension if not exists "uuid-ossp";
```

## Step 3: Add environment variables on your hosting

Required later for live Stripe testing:

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

## Step 4: Redeploy / restart app

## Step 5: Test admin pages
- `/admin?tab=control`
- `/admin?tab=revenue`

## Step 6: Optional Stripe webhook setup
After deploy, create a Stripe webhook pointing to:

```
https://YOUR-DOMAIN/api/stripe/webhook
```

Recommended test events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Safety note
This phase does **not** block users, change plans, or charge customers automatically. It is a safe foundation only.
