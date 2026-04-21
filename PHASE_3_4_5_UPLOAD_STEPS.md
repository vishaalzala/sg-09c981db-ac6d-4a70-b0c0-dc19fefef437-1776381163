# Phase 3, 4, 5 Combined Patch Upload Steps

This patch assumes your website already has Phase 1 and Phase 2 applied.

## What this patch adds
- Phase 3: Notifications foundation
- Phase 4: Messaging foundation
- Phase 5: Leads foundation
- Cumulative admin tabs so you do not lose Control Center or Revenue Ops when replacing files

## 1) Upload and replace files
Extract this patch zip and replace the matching files in your project.

## 2) Run this migration in Supabase SQL Editor
Run the contents of:

`supabase/migrations/20260421170000_phase3_4_5_foundation.sql`

If needed, run first:

```sql
create extension if not exists "uuid-ossp";
```

## 3) Add environment variables
Add these on your hosting platform or `.env.local`.

### SMTP foundation
```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=
```

### Twilio foundation
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_MESSAGING_SERVICE_SID=
```

## 4) Restart or redeploy
After replacing files and running the migration, restart the app.

## 5) Test these admin tabs
- `/admin?tab=control`
- `/admin?tab=revenue`
- `/admin?tab=notifications`
- `/admin?tab=messaging`
- `/admin?tab=leads`

## What is safe in this patch
- No quote, invoice, booking, job, customer, or login flow is changed
- SMTP and Twilio are health-check only in this patch
- Lead form API is backward-compatible and falls back to `lead_submissions`

## Files included
- `src/components/AdminLayout.tsx`
- `src/components/admin/ControlCenterPanel.tsx`
- `src/components/admin/RevenueOpsPanel.tsx`
- `src/components/admin/NotificationsPanel.tsx`
- `src/components/admin/MessagingPanel.tsx`
- `src/components/admin/LeadsPanel.tsx`
- `src/pages/admin/index.tsx`
- `src/pages/api/admin/notifications/health.ts`
- `src/pages/api/admin/messaging/health.ts`
- `src/pages/api/submit-lead.ts`
- `src/services/adminService.ts`
- `supabase/migrations/20260421170000_phase3_4_5_foundation.sql`
