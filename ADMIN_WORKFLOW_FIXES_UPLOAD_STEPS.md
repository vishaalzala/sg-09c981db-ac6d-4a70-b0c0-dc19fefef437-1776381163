Admin workflow fixes included in this patch:
- Leads panel: clickable lead detail modal, status update, assignment
- Users tab: Create User now works from a dialog and lets admin pick company
- Plans tab: create plan and edit plan
- Add-ons tab: create add-on and edit add-on
- Added secure admin API routes for plans, add-ons, and leads updates

Upload steps:
1. Extract this zip.
2. Copy the included files into your project, replacing existing files.
3. No SQL migration is required for this patch.
4. Make sure these env vars already exist on the server:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
5. Redeploy / restart the app.

Test after upload:
- /admin?tab=users -> Create User
- /admin?tab=leads -> View lead, assign, change status
- /admin?tab=plans -> Create Plan, Edit Plan
- /admin?tab=addons -> Create Add-on, Edit Add-on
