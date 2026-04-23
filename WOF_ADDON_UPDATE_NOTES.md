# WOF Add-on update notes

Updated by ChatGPT on 2026-04-23.

## Main changes
- Added company Settings > Add Ons tab using existing addon catalog/company_addons tables.
- Added WOF portal pages:
  - /wof
  - /wof/process
  - /wof/history
  - /wof/profile
- Added WOF portal layout with top header and WOF-only navigation.
- Added login redirect for `wof_inspector` role to `/wof`.
- Updated staff dialog to allow creating WOF inspectors when WOF add-on is active.
- Updated AppLayout WOF menu link to `/wof`.
- Redirected old `/dashboard/wof` pages to `/wof` to avoid duplicate WOF pages.

## Files changed
- src/components/AppLayout.tsx
- src/components/wof/WofPortalLayout.tsx
- src/pages/dashboard/settings/index.tsx
- src/pages/staff/index.tsx
- src/pages/login.tsx
- src/pages/dashboard/wof/index.tsx
- src/pages/dashboard/wof/new.tsx
- src/pages/wof/index.tsx
- src/pages/wof/process.tsx
- src/pages/wof/history.tsx
- src/pages/wof/profile.tsx
