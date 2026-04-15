---
title: Supplier and inventory module
status: todo
priority: medium
type: feature
tags: [frontend, backend, inventory]
created_by: agent
created_at: 2026-04-15T22:51:04Z
position: 8
---

## Notes
Build supplier management, purchase orders, and inventory tracking with branch-aware stock levels. Support stock movements, adjustments, low-stock alerts, and integration-ready architecture for PartsTrader/Capricorn/Repco.

## Checklist
- [ ] Create supplierService with CRUD, contacts, pricing notes, purchase history APIs
- [ ] Create purchaseOrderService with CRUD, PO items, status tracking, job linkage
- [ ] Create inventoryService with stock items, movements, adjustments, low-stock alerts, branch-aware queries
- [ ] Build Suppliers list page with search, preferred supplier flags
- [ ] Build Supplier detail page with contacts, pricing notes, purchase order history
- [ ] Build Purchase Orders list page with status filters, search
- [ ] Build PO form with supplier selector, line items, job linkage
- [ ] Build Inventory list page with stock levels by branch, low-stock highlighting, search
- [ ] Build inventory item form with supplier linkage, pricing, stock levels per branch
- [ ] Build stock movement log page with filters by item/branch/date
- [ ] Build stock adjustment form with reason tracking and audit trail
- [ ] Add low-stock alert notifications and dashboard widget