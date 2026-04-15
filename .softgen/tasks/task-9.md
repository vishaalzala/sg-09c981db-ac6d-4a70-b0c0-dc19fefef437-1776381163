---
title: WOF compliance module (paid add-on)
status: todo
priority: medium
type: feature
tags: [frontend, backend, wof, add-on]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 9
---

## Notes
Build complete WOF (Warrant of Fitness) inspection system as paid add-on. Mobile-friendly inspection interface, pass/fail workflow, recheck management, inspector certification tracking, equipment calibration, compliance logging.

Access control: only visible if WOF add-on enabled for company, only usable by users with WOF Inspector role.

WOF workflow: booking → check-in → inspector assignment → checklist inspection → pass/fail → fail creates repair job → recheck after repair → full audit trail

## Checklist
- [ ] Create wofService with inspections, rechecks, compliance logs, inspector certification APIs
- [ ] Build WOF Dashboard with booking queue, inspector assignment, pass/fail stats, recheck alerts
- [ ] Build WOF booking form within main bookings module (with WOF type flag)
- [ ] Build mobile-friendly WOF Inspection screen with checklist, pass/fail per item, photo/video upload, notes
- [ ] Build inspection detail page with full history, fail reasons, linked repair job, recheck status
- [ ] Build fail/recheck management screen with auto-create repair job workflow
- [ ] Build inspector certification management with expiry tracking and renewal reminders
- [ ] Build equipment register with calibration dates and maintenance tracking
- [ ] Build WOF compliance logs page with tamper-resistant audit trail, rule version tracking
- [ ] Add WOF history tab on vehicle detail page
- [ ] Wrap all WOF features in FeatureGate component checking WOF add-on entitlement
- [ ] Add inspector role checks on all WOF actions