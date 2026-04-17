# DEMO ACCOUNTS SETUP GUIDE

## Goal
Create working demo accounts **without any manual SQL** using the in-app Super Admin tools.

## Prerequisites (one-time, server-side)
Set these environment variables in Vercel (Project Settings → Environment Variables):
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- `ADMIN_BOOTSTRAP_TOKEN` (a long random secret)

## Step 1: Create / Bootstrap the first Super Admin (no Supabase dashboard)
1. Sign up normally in the app with the email you want to be the first Super Admin.
2. Visit `/admin`
3. If no Super Admin exists yet, you will see a **Bootstrap first Super Admin** card.
4. Paste your `ADMIN_BOOTSTRAP_TOKEN` and click **Make me Super Admin**.

## Step 2: Seed demo users (one click)
In `/admin` → Companies tab click **Seed demo users**.

This will create (or update) these accounts in Supabase Auth + link them in `profiles` and `users`:
- `admin@demo.com` (role: `super_admin`, no company)
- `owner@demo.com` (role: `owner`, company: Demo Workshop NZ)
- `staff@demo.com` (role: `staff`, company: Demo Workshop NZ)
- `inspector@demo.com` (role: `inspector`, company: Demo Workshop NZ)

Default password (shown in the toast and API response): `Demo123!`

## Step 3: Test login
Go to `/login` and sign in with any of the above accounts. Expected routing:
- `admin@demo.com` → `/admin`
- others → `/dashboard`

## Troubleshooting
- If admin actions fail with “Missing SUPABASE_SERVICE_ROLE_KEY”, you have not set the env var in Vercel and redeployed.
- If you see “Super admin already exists”, ask the existing Super Admin to create your user from `/admin`.