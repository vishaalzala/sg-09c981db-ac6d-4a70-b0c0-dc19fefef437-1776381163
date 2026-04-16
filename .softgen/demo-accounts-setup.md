# DEMO ACCOUNTS SETUP GUIDE

## CRITICAL: Manual Setup Required

Supabase Auth accounts cannot be created via SQL. Follow these steps:

## Step 1: Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** button

## Step 2: Create Demo Accounts

### Account 1: Super Admin
- **Email:** `admin@workshoppro.demo`
- **Password:** `Demo2024!Admin`
- **Auto Confirm:** YES
- After creation:
  1. Note the User ID (UUID)
  2. Go to Table Editor → profiles
  3. Find the profile with this user ID
  4. Update: `role = 'super_admin'`, `company_id = NULL`

### Account 2: Workshop Owner
- **Email:** `owner@workshoppro.demo`
- **Password:** `Demo2024!Owner`
- **Auto Confirm:** YES
- After creation:
  1. Note the User ID
  2. Go to Table Editor → profiles
  3. Find the profile
  4. Update: `role = 'owner'`, `company_id = [Demo Workshop NZ ID]`
  5. Go to Table Editor → users
  6. Insert: `id = [User ID]`, `company_id = [Demo Workshop NZ ID]`

### Account 3: Staff Member
- **Email:** `staff@workshoppro.demo`
- **Password:** `Demo2024!Staff`
- **Auto Confirm:** YES
- After creation:
  1. Note the User ID
  2. Go to Table Editor → profiles
  3. Update: `role = 'staff'`, `company_id = [Demo Workshop NZ ID]`
  4. Go to Table Editor → users
  5. Insert: `id = [User ID]`, `company_id = [Demo Workshop NZ ID]`

### Account 4: WOF Inspector
- **Email:** `inspector@workshoppro.demo`
- **Password:** `Demo2024!Inspector`
- **Auto Confirm:** YES
- After creation:
  1. Note the User ID
  2. Go to Table Editor → profiles
  3. Update: `role = 'inspector'`, `company_id = [Demo Workshop NZ ID]`
  4. Go to Table Editor → users
  5. Insert: `id = [User ID]`, `company_id = [Demo Workshop NZ ID]`

## Step 3: Get Demo Company ID

Run this SQL query:
```sql
SELECT id, name FROM companies WHERE name = 'Demo Workshop NZ';
```

Use this ID when setting `company_id` in profiles and users tables.

## Step 4: Test Login

1. Go to `/login`
2. Try each account
3. Verify correct redirects:
   - Super Admin → `/admin`
   - Workshop users → `/dashboard`

## Expected Behavior

After logging in:
- ✅ No "company context" errors
- ✅ Can create customers, vehicles, jobs
- ✅ All pages protected (can't access without login)
- ✅ Session persists across page refreshes

## Troubleshooting

**"No company context found":**
- Check users table has entry with correct company_id
- Check profiles table has correct company_id

**Can't login:**
- Verify email/password
- Check auto-confirm is enabled
- Check Supabase auth settings

**Redirect loop:**
- Clear browser cookies
- Check profile role is set correctly