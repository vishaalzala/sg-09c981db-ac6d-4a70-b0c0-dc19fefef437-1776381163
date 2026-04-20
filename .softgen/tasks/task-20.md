---
title: "New quote + invoice workflow completion (invoice.html parity)"
status: in_progress
priority: urgent
type: feature
tags: ["dashboard", "quotes", "invoices", "workflow", "invoice.html"]
created_by: agent
created_at: 2026-04-20
position: 20
---

## Notes
Implementar lo que falta para que `/dashboard/invoices/new` y `/dashboard/quotes/new` coincidan exactamente con `invoice.html.txt`, usando el **schema real existente** (sin tablas paralelas). Prioridad: popups de Change Customer / Change Vehicle (buscar + seleccionar + crear), Job Tyres/Job Kit (selección desde Job Types/Kits e inserción de múltiples filas editables), e inventario (buscar/seleccionar y crear stock inline).

## Checklist
- [ ] En Step 1, al seleccionar un customer/vehicle existente desde Matching Results, cargar y fijar los datos reales del registro seleccionado antes de avanzar a Step 2
- [ ] Implementar popup "Change Customer" (search + select + create new dentro del dialog) y aplicar los cambios a Step 2
- [ ] Implementar popup "Change Vehicle" (filtrar por customer, search + select + create new dentro del dialog)
- [ ] Sustituir `window.prompt` por UI en dialog para Future Sales Opportunities (Add/Edit) sin romper flujo
- [ ] Validar que se usan tablas reales: `customers`, `vehicles`, `quotes`, `quote_line_items`, `invoices`, `invoice_line_items`, `payments`, `reminders`, `reminder_types`, `sales_opportunities`, `job_types`
- [ ] check_for_errors

## Acceptance
Las páginas `/dashboard/invoices/new` y `/dashboard/quotes/new` permiten: seleccionar/crear customer y vehicle sin salir del flujo, insertar job kit con múltiples filas editables, y guardar el documento con items + reminders + payment usando el schema existente, sin errores.