---
title: Financial module (quotes, invoices, payments)
status: todo
priority: high
type: feature
tags: [frontend, backend, finance]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 7
---

## Notes
Build complete quoting and invoicing system with payment tracking. Quotes support approval/decline/partial approval. Invoices track payments with balance calculation and overdue alerts.

Quote fields: customer, vehicle, rego, quote date, expiry date, description, notes, line items (with optional/upsell flags), GST, status, tags, approval state, decline reason

Invoice fields: customer, vehicle, rego, invoice date, due date, linked job/quote, invoice to 3rd party option, notes, line items, GST, payment history, balance, status, tags

## Checklist
- [ ] Create quoteService with CRUD, approve/decline, convert to job/invoice APIs
- [ ] Create invoiceService with CRUD, payment recording, balance calculation APIs
- [ ] Create paymentService with payment recording, refund structure, payment methods
- [ ] Build Quotes list page with status filters, search, expiry alerts
- [ ] Build Quote form with customer/vehicle selectors, line items with optional/upsell toggles, expiry date
- [ ] Build quote detail page with approve/decline/partial approve actions, convert to job/invoice
- [ ] Build Invoices list page with status filters, overdue highlighting, payment status
- [ ] Build Invoice form with customer/vehicle selectors, linked job/quote, line items, 3rd party billing toggle
- [ ] Build invoice detail page with payment history panel, record payment modal, balance display
- [ ] Build payment recording modal with payment method, amount, date, reference
- [ ] Add GST calculation and display on quotes/invoices
- [ ] Build overdue invoice alerts and aging report structure