---
title: "Quote + invoice new workflow (invoice.html) verification + schema alignment"
status: in_progress
priority: high
type: bug
tags: ["dashboard", "quotes", "invoices", "reminders", "schema", "supabase"]
created_by: "agent"
created_at: "2026-04-20"
position: 19
---

## Notes
Verify that `/dashboard/quotes/new`, `/dashboard/invoices/new`, and `/dashboard/settings/reminders` match `invoice.html.txt` exactly and use the EXISTING database schema/table names (no duplicate parallel tables). Patch legacy pages only enough for build to pass. Provide user with a grounded completion summary and working login credentials already present in repo docs.

## Checklist
- [ ] Inspect Supabase schema: confirm existing invoice/quote line item table names and payment/reminders tables
- [ ] Inspect `src/components/DocumentBuilder.tsx`: ensure it writes/reads using existing tables consistently
- [ ] Verify `/dashboard/invoices/new` and `/dashboard/quotes/new` both render the shared DocumentBuilder with correct label replacements (Invoice vs Quote)
- [ ] Verify `/dashboard/settings/reminders` is usable and synced to reminders panel + finish modal
- [ ] Ensure no new duplicate tables are being used inadvertently; align services/UI to existing tables
- [ ] Run `check_for_errors` after any fixes
- [ ] Provide final status: completed / not completed / needs clarification + list all key pages + login credentials