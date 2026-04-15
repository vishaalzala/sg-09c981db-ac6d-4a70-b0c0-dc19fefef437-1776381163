---
title: Super Admin panel and dashboard
status: todo
priority: medium
type: feature
tags: [frontend, backend, admin]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 13
---

## Notes
Build SaaS owner admin panel for platform management. Manage companies, assign plans, enable/disable add-ons, configure usage pricing, view revenue dashboard, monitor add-on adoption, audit logs.

Super Admin role only — highest level access across all companies.

## Checklist
- [ ] Create Super Admin dashboard with revenue metrics, active companies, add-on adoption stats
- [ ] Build Companies management page with list, search, create company
- [ ] Build company detail page with plan assignment, add-on toggles, usage limits configuration
- [ ] Build subscription plans management with feature matrix editor
- [ ] Build add-on pricing configuration for WOF, Marketing, Website Builder, Loyalty, CARJAM usage tiers
- [ ] Build usage rules management for CARJAM (quota by plan, prepaid packs, overage rates)
- [ ] Build revenue dashboard with MRR, ARR, add-on revenue breakdown
- [ ] Build add-on adoption dashboard showing adoption rates per add-on
- [ ] Build audit logs viewer with filters by company, user, action type, date range
- [ ] Build support action logs for Super Admin operations
- [ ] Add company impersonation feature for support (with audit trail)