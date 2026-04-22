Updated in this package:
- Improved AppLayout sidebar and top bar
- Added dashboard sidebar links for WOF, Reports, Settings, Suppliers, Reminders
- Redirected /wof -> /dashboard/wof and /reports -> /dashboard/reports
- Rebuilt /dashboard/customers/[id] as a split customer + vehicle workspace
- Rebuilt /dashboard/inventory/new as a one-page stock form
- Rebuilt /dashboard/suppliers/new as a one-page supplier form
- Rebuilt /dashboard/reports for Received Payments
- Fixed quote/invoice inventory picker to use inventory_items description/sell_price schema
- Added SQL migration file for dedicated extra columns
