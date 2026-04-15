---
title: Design system and core UI components
status: todo
priority: high
type: feature
tags: [frontend, design, components]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 3
---

## Notes
Establish design system with automotive workshop aesthetics (navy/steel blue primary, amber accents). Create core reusable components used throughout the app.

Design tokens: deep navy primary, amber accent, steel blue secondary, professional typography (Plus Jakarta Sans headings, Work Sans body), status-driven color system for job/booking states

## Checklist
- [ ] Set up globals.css with design tokens (--primary navy, --accent amber, --secondary steel, status colors)
- [ ] Configure tailwind.config.ts with custom colors and fonts
- [ ] Import Plus Jakarta Sans and Work Sans fonts with proper weights
- [ ] Create StatusBadge component with variants for job/booking/quote/invoice states
- [ ] Create FeatureGate component that checks entitlements and shows lock/upgrade UI
- [ ] Create UpgradePrompt component for locked add-on features
- [ ] Create LoadingSpinner and EmptyState components
- [ ] Theme shadcn components with design tokens (buttons, badges, cards)