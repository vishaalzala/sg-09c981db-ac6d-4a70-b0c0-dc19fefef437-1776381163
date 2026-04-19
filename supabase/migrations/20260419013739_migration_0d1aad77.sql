-- Drop redundant SELECT policies on companies (keep the comprehensive one)
DROP POLICY IF EXISTS "users_see_own_company" ON companies;

-- Drop redundant SELECT policy on profiles (true policy covers everything)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Drop redundant SELECT policy on users (users_select_all already covers everything)
DROP POLICY IF EXISTS "users_see_company_users" ON users;