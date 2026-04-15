---
title: CRM module (customers and vehicles)
status: todo
priority: high
type: feature
tags: [frontend, backend, crm]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 5
---

## Notes
Build complete customer and vehicle management with all fields specified in requirements. Include customer merge, vehicle move, detailed forms with contacts/addresses, reminder summary, linked records (vehicles, jobs, invoices).

Customer form: name, is_company, mobile, phone, email, postal address, physical address, source of business, notes, tags, marketing consent, contacts (for company customers)

Vehicle form: customer link, rego, VIN, make, model, year, body type, odometer, color, engine size, transmission, fuel type, WOF expiry, rego expiry, service due, last service odometer, courtesy vehicle flag, tags, files

## Checklist
- [ ] Create customerService with CRUD, search, merge, and related records APIs
- [ ] Create vehicleService with CRUD, search, move, CARJAM fetch APIs
- [ ] Build Customers list page with search, filters, and create button
- [ ] Build Customer detail page with tabs: overview, vehicles, jobs, quotes, invoices, reminders, notes
- [ ] Build Customer form with all required fields, address blocks, contacts (for companies), tags
- [ ] Build customer merge dialog with primary customer selection and audit trail
- [ ] Build Vehicles list page with search and filters
- [ ] Build Vehicle detail page with tabs: overview, jobs, quotes, invoices, WOF history, reminders, files
- [ ] Build Vehicle form with all required fields, CARJAM fetch button (if enabled), photo upload
- [ ] Build vehicle move dialog to transfer vehicle to another customer with history preservation
- [ ] Add reminder summary widget showing upcoming due dates on customer/vehicle detail pages