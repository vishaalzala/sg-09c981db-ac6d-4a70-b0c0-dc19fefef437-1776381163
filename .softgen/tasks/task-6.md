---
title: Operations module (bookings and jobs)
status: todo
priority: high
type: feature
tags: [frontend, backend, operations]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 6
---

## Notes
Build booking calendar and job management system. Bookings have calendar/day/week views with drag-and-drop. Jobs have detailed workflow with statuses, line items, technician assignment, attachments, and linked quotes/invoices.

Booking fields: customer, vehicle, rego, service type, description, notes, booking date, start time, estimated finish, pickup time, mechanic, branch, courtesy vehicle required, approval limit, source of business, tags

Job fields: customer, vehicle, job title, invoice to 3rd party (toggle), description, notes, job types (multi-select), mechanics (multi-assign), start time, estimated finish, pickup time, estimated work hours, order number, odometer, courtesy vehicle, tags, line items (labour/parts)

Job statuses: booked, checked in, in progress, waiting approval, waiting parts, paused, ready for pickup, completed, invoiced, closed

## Checklist
- [ ] Create bookingService with CRUD, calendar queries, convert to job APIs
- [ ] Create jobService with CRUD, status updates, line items, attachments APIs
- [ ] Build Bookings page with calendar view (day/week/month), filters by branch/mechanic
- [ ] Build booking form with customer/vehicle selectors, time pickers, mechanic assignment
- [ ] Build booking detail modal with convert to job action
- [ ] Build Jobs list page with status filters, search, branch filters
- [ ] Build New Job page with detailed form (3 sections: customer, vehicle, job details)
- [ ] Build Job detail page with tabs: overview, line items, notes, attachments, status history, linked records
- [ ] Build LineItemEditor component for adding labour/parts with pricing
- [ ] Build job status timeline component showing status changes with timestamps
- [ ] Add convert booking to job workflow
- [ ] Add link job to quote/invoice functionality