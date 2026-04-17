-- Now optimize policies using the helper functions

-- Companies
DROP POLICY IF EXISTS "companies_select_combined" ON companies;
DROP POLICY IF EXISTS "users_company_update" ON companies;

CREATE POLICY "companies_select_opt" ON companies
  FOR SELECT USING (
    id = public.current_user_company_id() OR public.is_super_admin()
  );

CREATE POLICY "companies_update_opt" ON companies
  FOR UPDATE USING (
    id = public.current_user_company_id() OR public.is_super_admin()
  );

-- Branches
DROP POLICY IF EXISTS "branches_select_combined" ON branches;
DROP POLICY IF EXISTS "users_branch_insert" ON branches;
DROP POLICY IF EXISTS "users_branch_update" ON branches;
DROP POLICY IF EXISTS "users_branch_delete" ON branches;

CREATE POLICY "branches_select_opt" ON branches
  FOR SELECT USING (
    company_id = public.current_user_company_id() OR public.is_super_admin()
  );

CREATE POLICY "branches_insert_opt" ON branches
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "branches_update_opt" ON branches
  FOR UPDATE USING (
    company_id = public.current_user_company_id() OR public.is_super_admin()
  );

CREATE POLICY "branches_delete_opt" ON branches
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Users
DROP POLICY IF EXISTS "users_select_combined" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;

CREATE POLICY "users_select_opt" ON users
  FOR SELECT USING (
    company_id = public.current_user_company_id() OR public.is_super_admin()
  );

CREATE POLICY "users_insert_opt" ON users
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "users_update_opt" ON users
  FOR UPDATE USING (
    id = auth.uid() OR company_id = public.current_user_company_id()
  );

CREATE POLICY "users_delete_opt" ON users
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Customers
DROP POLICY IF EXISTS "users_customers_select" ON customers;
DROP POLICY IF EXISTS "users_customers_insert" ON customers;
DROP POLICY IF EXISTS "users_customers_update" ON customers;
DROP POLICY IF EXISTS "users_customers_delete" ON customers;

CREATE POLICY "customers_select_opt" ON customers
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "customers_insert_opt" ON customers
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "customers_update_opt" ON customers
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "customers_delete_opt" ON customers
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Vehicles
DROP POLICY IF EXISTS "users_vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "users_vehicles_insert" ON vehicles;
DROP POLICY IF EXISTS "users_vehicles_update" ON vehicles;
DROP POLICY IF EXISTS "users_vehicles_delete" ON vehicles;

CREATE POLICY "vehicles_select_opt" ON vehicles
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "vehicles_insert_opt" ON vehicles
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "vehicles_update_opt" ON vehicles
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "vehicles_delete_opt" ON vehicles
  FOR DELETE USING (company_id = public.current_user_company_id());