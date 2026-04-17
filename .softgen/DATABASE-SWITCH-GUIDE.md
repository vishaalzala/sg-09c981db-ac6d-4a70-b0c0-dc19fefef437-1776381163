# DATABASE SWITCH VERIFICATION GUIDE

## Current Status
- ✅ `.env.local` updated to point to YOUR Supabase (kbnemkhxroawmcnjbbil)
- ⚠️ YOU must provide the actual API keys
- ⚠️ YOU must run the migration SQL in YOUR database

---

## STEP 1: GET YOUR SUPABASE API KEYS (REQUIRED)

1. Go to: https://supabase.com/dashboard/project/kbnemkhxroawmcnjbbil
2. Click: **Settings** → **API**
3. Copy these THREE values:

**A) Project URL** (already set)
```
https://kbnemkhxroawmcnjbbil.supabase.co
```

**B) Anon/Public Key** (starts with `eyJhbGc...`)
- This is your **public** key for frontend
- Copy the entire key (very long)

**C) Service Role Key** (starts with `eyJhbGc...`, different from anon)
- This is your **server-side** key for admin functions
- NEVER expose this in frontend code
- Only used in API routes

**D) Generate Bootstrap Token**
- Create a long random string (30+ characters)
- Example: `bootstrap_super_secret_token_12345_xyz`
- You'll use this ONCE to create first Super Admin

---

## STEP 2: UPDATE .env.local WITH YOUR KEYS

Open `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kbnemkhxroawmcnjbbil.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...[PASTE YOUR ANON KEY HERE]
NEXT_PUBLIC_SITE_URL=https://3000-09c981db-ac6d-4a70-b0c0-dc19fefef437.softgen.dev
SUPABASE_DB_PASSWORD=A1BKR--wyC-4JVqE7YMpsDEyKTClMnEq
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...[PASTE YOUR SERVICE ROLE KEY HERE]
ADMIN_BOOTSTRAP_TOKEN=bootstrap_super_secret_token_12345_xyz
```

**Save the file.**

---

## STEP 3: RUN DATABASE MIGRATION IN YOUR SUPABASE

1. Go to: https://supabase.com/dashboard/project/kbnemkhxroawmcnjbbil/sql/new
2. Open local file: `supabase/migrations/20260416215806_production_migration.sql`
3. Copy **ALL 632 lines**
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. Wait for success message

**This creates:**
- All 50+ tables (companies, users, profiles, customers, vehicles, jobs, quotes, invoices, payments, wof_inspections, etc.)
- All foreign key relationships
- All RLS policies for multi-tenant security
- Demo company "Demo Workshop NZ"
- Sample customers (John Smith, ABC Transport Ltd)
- Sample vehicles (Toyota Corolla, Honda Accord)

**Expected Result:**
```
Success. No rows returned.
```

---

## STEP 4: RESTART DEV SERVER

```bash
# Stop the server (Ctrl+C)
npm run dev
```

The app will now connect to YOUR Supabase.

---

## STEP 5: VERIFY DATABASE MIGRATION (CHECK TABLES)

In Supabase Dashboard → **Table Editor**, verify these tables exist:

**Core Tables:**
- [ ] companies
- [ ] users
- [ ] profiles
- [ ] customers
- [ ] vehicles
- [ ] jobs
- [ ] quotes
- [ ] invoices
- [ ] payments
- [ ] bookings
- [ ] job_line_items
- [ ] quote_line_items
- [ ] invoice_line_items

**WOF Tables:**
- [ ] wof_inspections
- [ ] wof_inspection_items
- [ ] wof_rechecks

**SaaS Tables:**
- [ ] subscription_plans
- [ ] addon_catalog
- [ ] company_addons
- [ ] company_subscriptions

**If ANY table is missing**, re-run the migration SQL.

---

## STEP 6: VERIFY DEMO DATA EXISTS

In Table Editor:

**companies table:**
- [ ] Row exists: "Demo Workshop NZ" (id: `95dcaa65-dad9-42c1-9312-25130e5feaf3`)

**customers table:**
- [ ] Row exists: "John Smith"
- [ ] Row exists: "ABC Transport Ltd"

**vehicles table:**
- [ ] Row exists: Toyota Corolla (rego: ABC123)
- [ ] Row exists: Honda Accord (rego: XYZ789)

**If missing**, demo data didn't migrate. Not critical for signup, but helpful for testing.

---

## STEP 7: TEST SIGNUP FLOW (CRITICAL VERIFICATION)

### A) Create Test Account
1. Open browser: `http://localhost:3000/signup`
2. Fill in:
   - Full Name: **Test User**
   - Email: **test@workshop.co.nz**
   - Password: **Test123!**
   - Confirm Password: **Test123!**
   - Company Name: **Test Workshop**
   - Phone: **+64 21 123 4567**
3. Click **"Create Workshop Account"**
4. Expected: Success toast + redirect to `/dashboard`

### B) VERIFY IN YOUR SUPABASE (PROOF OF CONNECTION)

**Authentication Check:**
1. Go to: https://supabase.com/dashboard/project/kbnemkhxroawmcnjbbil/auth/users
2. **CRITICAL:** You should see `test@workshop.co.nz` in the users list
3. Click on the user → verify `email_confirmed_at` is set

**Database Check (Table Editor):**

**companies table:**
- [ ] New row: "Test Workshop"
- [ ] Note the company `id` (UUID)

**profiles table:**
- [ ] New row with user's UUID as `id`
- [ ] `role = 'owner'`
- [ ] `email = 'test@workshop.co.nz'`
- [ ] `full_name = 'Test User'`

**users table:**
- [ ] New row with user's UUID as `id`
- [ ] `company_id` matches "Test Workshop" company id
- [ ] `email = 'test@workshop.co.nz'`
- [ ] `role = 'owner'`

**payment_methods table:**
- [ ] 4 new rows linked to Test Workshop company:
  - Cash
  - EFTPOS
  - Credit Card
  - Bank Transfer

### C) Test Login
1. Log out
2. Go to: `http://localhost:3000/login`
3. Email: **test@workshop.co.nz**
4. Password: **Test123!**
5. Click **"Sign In"**
6. Expected: Redirect to `/dashboard`
7. Dashboard should show: "Test Workshop" as company name
8. No "company context" errors

**If ALL checks pass:** ✅ Database switch is COMPLETE and VERIFIED

---

## STEP 8: TEST ADMIN USER CREATION (SECONDARY VERIFICATION)

### A) Bootstrap First Super Admin
1. Go to: `http://localhost:3000/admin`
2. You'll see "Bootstrap first Super Admin" card
3. Paste YOUR bootstrap token (from .env.local)
4. Click **"Make me Super Admin"**

**Verify in Supabase:**
- profiles table: Your user now has `role = 'super_admin'`

### B) Seed Demo Users
1. In `/admin` → Companies tab
2. Click **"Seed demo users"**
3. Wait for success toast

**Verify in Supabase → Authentication → Users:**
- [ ] admin@demo.com exists
- [ ] owner@demo.com exists
- [ ] staff@demo.com exists
- [ ] inspector@demo.com exists

**Verify in profiles table:**
- [ ] admin@demo.com has `role = 'super_admin'`, `company_id = null`
- [ ] owner@demo.com has `role = 'owner'`, `company_id = Demo Workshop NZ id`
- [ ] staff@demo.com has `role = 'staff'`, `company_id = Demo Workshop NZ id`
- [ ] inspector@demo.com has `role = 'inspector'`, `company_id = Demo Workshop NZ id`

### C) Test Demo Login
1. Log out
2. Login as: `owner@demo.com` / `Demo123!`
3. Should redirect to `/dashboard`
4. Should show "Demo Workshop NZ" as company

**If ALL checks pass:** ✅ Admin functions working on YOUR database

---

## STEP 9: FINAL VERIFICATION CHECKLIST

- [ ] `.env.local` has YOUR Supabase URL (kbnemkhxroawmcnjbbil)
- [ ] `.env.local` has YOUR anon key
- [ ] `.env.local` has YOUR service role key
- [ ] Migration SQL ran successfully in YOUR database
- [ ] All required tables exist in YOUR database
- [ ] Signup creates user in YOUR Supabase Auth
- [ ] Signup creates company in YOUR database
- [ ] Signup creates profile/users rows in YOUR database
- [ ] Login works with newly created account
- [ ] Dashboard loads without errors
- [ ] Admin panel can create Super Admin
- [ ] Admin panel can seed demo users
- [ ] Demo users appear in YOUR Supabase Auth

**If ALL checked:** ✅ **DATABASE SWITCH COMPLETE AND VERIFIED**

---

## TROUBLESHOOTING

### Issue: "Missing Supabase environment variables"
**Solution:** You didn't update `.env.local` with actual keys. Copy from Supabase Dashboard → Settings → API.

### Issue: Signup fails with "Invalid API key"
**Solution:** Wrong anon key. Double-check you copied the ANON key, not service role key.

### Issue: Tables don't exist
**Solution:** Migration SQL wasn't run. Go to Supabase SQL Editor and run the migration file.

### Issue: "No company context found" after login
**Solution:** 
1. Check users table: user must have a `company_id`
2. Check companies table: company must exist
3. Re-signup with a fresh email to test clean workflow

### Issue: Admin functions fail
**Solution:** You didn't set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Get it from Supabase → Settings → API → Service Role.

---

## PROOF OF SUCCESSFUL SWITCH

**Before Switch:**
- Users appeared in: https://ehpjjgsmcmvufokltclj.supabase.co (Softgen)

**After Switch:**
- Users appear in: https://kbnemkhxroawmcnjbbil.supabase.co (YOUR Supabase) ✅

**Verification Method:**
1. Create new signup
2. Check YOUR Supabase → Authentication → Users
3. New user must be there (not in Softgen's database)

---

**Status:** Configuration updated, awaiting YOUR API keys and migration execution.