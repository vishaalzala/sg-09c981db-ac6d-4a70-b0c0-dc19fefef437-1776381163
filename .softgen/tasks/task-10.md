---
title: SaaS billing and entitlements system
status: todo
priority: high
type: feature
tags: [backend, frontend, saas, billing]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 10
---

## Notes
Build complete SaaS subscription and entitlement system. Support subscription plans (Starter, Growth, Pro), paid add-ons (WOF, Marketing, Website Builder, Loyalty, CARJAM), usage tracking for metered billing.

Plans: Starter, Growth, Pro
Add-ons: WOF Compliance, Marketing/Social, Website Builder, Loyalty, CARJAM Usage (metered)

Entitlement middleware must block unauthorized access. Frontend must hide/lock disabled features with upgrade prompts.

## Checklist
- [ ] Create billingService with subscription management, add-on assignment, usage tracking, quota checks APIs
- [ ] Create entitlementService with feature checks (hasWOF, hasMarketing, hasWebsiteBuilder, hasLoyalty, canUseCARJAM)
- [ ] Build subscription plans catalog with features per plan
- [ ] Build company subscription management page showing active plan, add-ons, usage
- [ ] Build add-on marketplace page with enable/disable toggles (company owner only)
- [ ] Build usage dashboard for CARJAM lookups showing quota, consumed, overage
- [ ] Build usage recording on CARJAM API calls with quota validation
- [ ] Create entitlement middleware for backend API protection
- [ ] Create useEntitlements hook for frontend feature gating
- [ ] Build UpgradePrompt component shown when locked features are accessed
- [ ] Add billing summary page with invoice-ready structure
- [ ] Implement usage-based billing calculation for CARJAM (quota + prepaid packs + overage)