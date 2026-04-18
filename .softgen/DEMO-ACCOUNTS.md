# 🔐 DEMO ACCOUNT CREDENTIALS

**Created**: 2026-04-18  
**Environment**: Production

---

## 🎯 TEST ACCOUNTS

### **1. SUPER ADMIN ACCOUNT** 🛡️

**Purpose**: Full platform administration access

**Credentials**:
```
Email: admin@workshoppro.com
Password: SuperAdmin123!
```

**Access Level**:
- ✅ Admin Panel (`/admin`)
- ✅ All companies view
- ✅ All users management
- ✅ Plans & add-ons management
- ✅ Roles & permissions management
- ✅ Audit logs
- ✅ System reports
- ✅ Create/edit/delete companies
- ✅ Bootstrap new super admins

**What You Can Do**:
- View all companies in the system
- Create new companies with trial subscriptions
- Manage all users across all companies
- Configure subscription plans and add-ons
- Manage role-based permissions
- View complete audit trail
- Access platform-wide analytics

**Login URL**: `https://your-domain.com/login`

---

### **2. DEMO OWNER ACCOUNT** 👤

**Purpose**: Company owner - workshop management

**Credentials**:
```
Email: demo@workshoppro.com
Password: DemoOwner123!
```

**Company Details**:
- **Name**: Demo Workshop Ltd
- **Location**: Auckland, New Zealand
- **Phone**: +64 9 123 4567
- **Status**: Active (14-day trial)

**Access Level**:
- ✅ Dashboard (`/dashboard`)
- ✅ Customers management
- ✅ Vehicles management
- ✅ Bookings calendar
- ✅ Job management
- ✅ Quotes & invoicing
- ✅ Inventory control
- ✅ WOF inspections (NZ)
- ✅ Staff management
- ✅ Reports & analytics
- ✅ Company settings
- ✅ Billing management

**What You Can Do**:
- Manage customers and vehicles
- Create and schedule bookings
- Create jobs and track progress
- Generate quotes and invoices
- Track payments
- Manage inventory stock
- Perform WOF inspections
- Add and manage staff members
- View business reports
- Configure company settings

**Login URL**: `https://your-domain.com/login`

---

## 🧪 TESTING SCENARIOS

### **Super Admin Testing**:

1. **Login as Super Admin**:
   ```
   Navigate to /login
   Enter: admin@workshoppro.com
   Password: SuperAdmin123!
   ```

2. **Access Admin Panel**:
   ```
   After login → Should redirect to /admin
   View dashboard with platform stats
   ```

3. **Create New Company**:
   ```
   Admin Panel → Companies tab → "Create Company"
   Fill in company details
   Assign 14-day trial
   Create owner account
   ```

4. **Manage Roles & Permissions**:
   ```
   Admin Panel → Roles tab
   Select a role → Assign/remove permissions
   Create new custom roles
   ```

5. **View Audit Logs**:
   ```
   Admin Panel → Audit tab
   See all system activities
   Filter by date/action/user
   ```

---

### **Owner Testing**:

1. **Login as Owner**:
   ```
   Navigate to /login
   Enter: demo@workshoppro.com
   Password: DemoOwner123!
   ```

2. **Explore Dashboard**:
   ```
   After login → Should redirect to /dashboard
   View workshop stats and metrics
   ```

3. **Create Customer**:
   ```
   Navigate to /customers
   Click "Add Customer"
   Fill in customer details
   Save
   ```

4. **Create Vehicle**:
   ```
   Navigate to /vehicles
   Click "Add Vehicle"
   Select customer
   Enter registration, make, model
   Save
   ```

5. **Create Booking**:
   ```
   Navigate to /bookings
   Click "New Booking"
   Select customer & vehicle
   Choose date/time
   Add service details
   Confirm
   ```

6. **Create Job**:
   ```
   Navigate to /jobs
   Click "New Job"
   Select customer & vehicle
   Add labour & parts
   Track progress
   ```

7. **Generate Quote**:
   ```
   Navigate to /quotes
   Click "New Quote"
   Build itemized quote
   Send to customer
   ```

8. **Create Invoice**:
   ```
   Navigate to /invoices
   Click "New Invoice"
   Select job or create standalone
   Send invoice
   Record payment
   ```

---

## 🔒 SECURITY NOTES

**Password Requirements**:
- Minimum 8 characters
- Contains uppercase letter
- Contains number
- Contains special character

**Account Security**:
- ✅ Passwords are hashed with bcrypt
- ✅ Email verification enabled
- ✅ Multi-tenant data isolation (RLS)
- ✅ Role-based access control
- ✅ Session management via Supabase Auth

**Best Practices**:
- Change these passwords in production
- Use strong, unique passwords
- Enable 2FA when available
- Regularly audit user access
- Monitor audit logs

---

## 🚨 IMPORTANT NOTES

### **For Development/Testing**:
- ✅ These accounts are safe to use
- ✅ Pre-configured with proper roles
- ✅ Demo company has trial subscription
- ✅ All permissions pre-assigned

### **For Production**:
- ⚠️ **CHANGE THESE PASSWORDS IMMEDIATELY**
- ⚠️ Consider removing demo accounts
- ⚠️ Create real admin accounts
- ⚠️ Use strong password policy
- ⚠️ Enable MFA for admins

---

## 📞 SUPPORT

If you have issues logging in:

1. **Check environment variables** (`.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Verify database connection**:
   - Check Supabase project is active
   - Verify API keys are correct
   - Test connection in Supabase dashboard

3. **Reset password**:
   - Use "Forgot Password" on login page
   - Or update directly in Supabase Auth dashboard

4. **Contact support**:
   - Check audit logs for login attempts
   - Review error messages in browser console
   - Contact Softgen support if needed

---

## 🎯 QUICK START GUIDE

**First Time Setup**:

1. **Login as Super Admin**:
   - Go to `/login`
   - Use `admin@workshoppro.com` / `SuperAdmin123!`
   - Verify admin panel access

2. **Login as Demo Owner**:
   - Open new incognito window
   - Go to `/login`
   - Use `demo@workshoppro.com` / `DemoOwner123!`
   - Verify workshop features

3. **Test Signup Flow**:
   - Go to `/signup`
   - Create new trial account
   - Verify 14-day trial assigned
   - Test workshop features

---

**End of Demo Accounts Documentation**