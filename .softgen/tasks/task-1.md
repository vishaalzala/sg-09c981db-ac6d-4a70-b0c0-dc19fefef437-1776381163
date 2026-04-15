---
title: Database schema and multi-tenant foundation
status: in_progress
priority: urgent
type: feature
tags: [database, backend, multi-tenant]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 1
---

## Notes
Build complete PostgreSQL schema with 50+ tables for multi-tenant SaaS. Include proper indexes, foreign keys, RLS policies for tenant isolation, and audit fields (created_at, updated_at, created_by, deleted_at).

Core requirements:
- Multi-tenant with company_id scoping on all tenant records
- Branch support with branch_id where relevant
- Soft delete support via deleted_at
- Search indexes on customer name, mobile, phone, email, rego, VIN, order_number
- Proper relationships: customer→vehicle→booking→job→quote→invoice→payment
- SaaS billing tables for plans, add-ons, entitlements, usage tracking
- WOF compliance tables with inspector certification and equipment calibration
- Customer portal and loyalty tables
- Audit logging architecture

## Checklist
- [x] Create companies and branches tables with proper hierarchy
- [x] Create users, roles, permissions tables for RBAC system
- [ ] Create subscription_plans, company_subscriptions, addon_catalog, company_addons, feature_entitlements tables
- [ ] Create usage_records and billing_events tables for metered billing
- [ ] Create customers, customer_contacts, customer_notes, customer_addresses, vehicles, vehicle_files tables
- [ ] Create reminders table with flexible reminder types
- [ ] Create tags, customer_tags, vehicle_tags for tagging system
- [ ] Create bookings, jobs, job_line_items, job_attachments, job_status_history, courtesy_vehicles tables
- [ ] Create quotes, quote_line_items, invoices, invoice_line_items, payments, refunds, credit_notes tables
- [ ] Create suppliers, supplier_contacts, purchase_orders, purchase_order_items tables
- [ ] Create inventory_items, inventory_movements, stock_adjustments tables
- [ ] Create WOF tables: wof_inspections, wof_inspection_items, wof_rechecks, wof_rule_versions, wof_compliance_logs, inspector_certifications, inspection_equipment, equipment_calibrations
- [ ] Create customer_portal_users, loyalty_accounts, loyalty_transactions tables
- [ ] Create marketing_campaigns, websites, website_leads tables
- [ ] Create audit_logs, activity_logs, integrations, api_usage_logs tables
- [ ] Add search indexes on customers (name, mobile, phone, email), vehicles (rego, VIN), jobs/quotes/invoices (order_number)
- [ ] Set up RLS policies for all tenant-scoped tables using company_id
- [ ] Create database types and verify schema