---
title: Global search and reusable selectors
status: todo
priority: high
type: feature
tags: [frontend, search, components]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 4
---

## Notes
Build global search system that works across customers, vehicles, bookings, jobs, quotes, invoices. Search by customer name, mobile, phone, email, rego, VIN, order number. Create reusable selector components used in booking/job/quote/invoice forms.

Search must show live suggestions, allow keyboard navigation, open matching records, and support inline creation of new customers/vehicles.

## Checklist
- [ ] Create searchService with unified search API endpoint that queries customers, vehicles, jobs, quotes, invoices
- [ ] Build GlobalSearchBar component for top navigation with instant suggestions and keyboard navigation
- [ ] Create CustomerSelector component with search, select existing, create new inline
- [ ] Create VehicleSelector component with search, select existing, create new inline, auto-fill details
- [ ] Create MechanicSelector for assigning technicians to jobs/bookings
- [ ] Create TagSelector for multi-select tagging
- [ ] Create SourceOfBusinessSelector dropdown
- [ ] Build search result UI with entity type badges and quick actions
- [ ] Add CARJAM fetch integration in VehicleSelector (with entitlement check and usage tracking)