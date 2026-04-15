---
title: Smart check-in and tablet mode
status: todo
priority: medium
type: feature
tags: [frontend, tablet, customer-facing]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 12
---

## Notes
Build simple front-desk kiosk/tablet mode for customer self-check-in. Large touch-friendly UI, minimal fields, search/create customer, CARJAM fetch (if enabled), create booking or intake record.

Fields: name, mobile, phone, email, rego, service required, issue description, pickup time, approval limit

## Checklist
- [ ] Create dedicated check-in route with fullscreen tablet-optimized layout
- [ ] Build large touch-friendly search field for customer lookup by name/mobile/phone/email/rego
- [ ] Build simplified customer form for inline creation with essential fields only
- [ ] Build vehicle selector with CARJAM fetch button (if enabled) and inline vehicle creation
- [ ] Build service type selector with common workshop services
- [ ] Build issue description textarea with large font
- [ ] Build pickup time selector with time slots
- [ ] Build approval limit input with common preset amounts
- [ ] Add create booking action that routes to workshop job queue
- [ ] Use extra-large buttons, high-contrast text, minimal UI chrome for kiosk use