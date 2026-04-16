---
title: Restructure Platform Layers
status: in_progress
priority: urgent
type: chore
tags: [architecture, routing, auth]
created_by: agent
created_at: 2026-04-16
position: 14
---

## Notes
Restructure the application into 4 layers: Public Marketing, Auth, Super Admin, and Workshop Operations. Move all workshop pages to /app prefix.

## Checklist
- [x] Move workshop modules to /pages/app/
- [ ] Create SaaS Marketing pages (/, /features, /pricing, /addons, /contact)
- [ ] Create Auth pages (/login, /forgot-password, /reset-password)
- [ ] Update AppLayout navigation to use /app prefix
- [ ] Implement role-based redirect in login logic
- [ ] Update Admin panel to include usage and plan management