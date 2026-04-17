-- ============================================
-- FIX: Multiple Permissive Policies
-- Combine multiple policies for same role+action into single policy
-- ============================================

-- FIX: companies table - combine duplicate SELECT policies
DROP POLICY IF EXISTS "users_company_select" ON companies;
DROP POLICY IF EXISTS "super_admin_full_access" ON companies;

CREATE POLICY "companies_select_combined" ON companies
  FOR SELECT USING (
    id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'Super Admin'
    )
  );

-- FIX: branches table - combine duplicate SELECT policies
DROP POLICY IF EXISTS "users_branch_select" ON branches;
DROP POLICY IF EXISTS "super_admin_full_access" ON branches;

CREATE POLICY "branches_select_combined" ON branches
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'Super Admin'
    )
  );

-- FIX: users table - combine duplicate SELECT policies
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "super_admin_full_access" ON users;

CREATE POLICY "users_select_combined" ON users
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'Super Admin'
    )
  );

-- FIX: tags table - combine duplicate SELECT policies
DROP POLICY IF EXISTS "users_tags_select" ON tags;
DROP POLICY IF EXISTS "super_admin_full_access" ON tags;

CREATE POLICY "tags_select_combined" ON tags
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'Super Admin'
    )
  );

-- FIX: customer_portal_users table - combine duplicate SELECT policies
DROP POLICY IF EXISTS "portal_users_see_own" ON customer_portal_users;
DROP POLICY IF EXISTS "staff_see_company_portal_users" ON customer_portal_users;

CREATE POLICY "customer_portal_users_select_combined" ON customer_portal_users
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );