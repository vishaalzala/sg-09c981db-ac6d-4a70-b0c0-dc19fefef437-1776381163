# 🔄 RESTART SERVER INSTRUCTIONS

**CRITICAL**: After environment variable changes, you MUST restart the Next.js development server.

---

## 🚨 WHY YOU'RE SEEING ERRORS

### **Error 1: "Database error querying schema"**
- **Cause**: Missing RLS policy on profiles table
- **Status**: ✅ FIXED (policy created)

### **Error 2: "Missing Supabase service key"**
- **Cause**: Environment variables not loaded
- **Status**: ⚠️ NEEDS SERVER RESTART

---

## ✅ HOW TO FIX (STEP-BY-STEP)

### **Method 1: Click "Restart Server" Button** (EASIEST)
1. Look at the **top-right corner** of Softgen interface
2. Click the **Settings icon** (gear icon)
3. Click **"Restart Server"** button
4. Wait 10-15 seconds for server to restart
5. Refresh the page
6. Try login/signup again

### **Method 2: Manual Terminal Restart**
If you have access to the terminal:
```bash
# Stop the server (Ctrl+C)
# Then restart it:
npm run dev
```

### **Method 3: PM2 Restart** (If using PM2)
```bash
pm2 restart all
```

---

## 🔍 VERIFY IT'S WORKING

After restarting the server:

### **Test 1: Environment Variables Loaded**
Open browser console and check:
```javascript
// This should NOT be undefined
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### **Test 2: Login Works**
1. Go to `/login`
2. Enter: `demo@workshoppro.com`
3. Password: `DemoOwner123!`
4. Should redirect to dashboard

### **Test 3: Signup Works**
1. Go to `/signup`
2. Fill in form
3. Should create account without "Missing service key" error

---

## 📋 WHAT WAS FIXED

### **1. RLS Policy Added** ✅
```sql
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

This allows authenticated users to read their own profile during login.

### **2. Environment Variables Verified** ✅
All required variables are present in `.env.local`:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ ADMIN_BOOTSTRAP_TOKEN

### **3. Error Handling Improved** ✅
Login page now shows specific error messages:
- "User profile not found" (if profile missing)
- "Database permission error" (if RLS blocking)
- Actual error message from database

---

## 🎯 EXPECTED RESULT AFTER RESTART

### **Login Page** (/login)
- ✅ No "Database error querying schema"
- ✅ Can login with demo@workshoppro.com
- ✅ Redirects to correct page based on role

### **Signup Page** (/signup)
- ✅ No "Missing Supabase service key" error
- ✅ Can create new trial account
- ✅ Auto-login and redirect to dashboard

---

## 🚨 IF ERRORS PERSIST AFTER RESTART

### **Check 1: Verify Environment Variables**
In your terminal where the server is running, you should see:
```
- Local:        http://localhost:3000
- Environment:  development
```

### **Check 2: Check Browser Console**
Open browser DevTools (F12) → Console tab → Look for errors

### **Check 3: Check Server Logs**
Look at terminal where `npm run dev` is running for errors

### **Check 4: Hard Refresh**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

---

## 📞 STILL NOT WORKING?

If after restarting the server you still see errors:

1. **Copy the EXACT error message** from browser
2. **Copy server logs** from terminal
3. **Share both** for further debugging

Common issues:
- Cached environment variables (need hard refresh)
- Port already in use (kill process on port 3000)
- Missing .env.local file (verify it exists)
- Supabase project connection issues

---

## ✅ VERIFICATION CHECKLIST

Before testing, ensure:
- [ ] Server restarted (via Softgen button or terminal)
- [ ] Browser hard-refreshed (Ctrl+Shift+R)
- [ ] No console errors visible
- [ ] .env.local file exists with all keys

---

**🎉 After server restart, login and signup should work perfectly!**