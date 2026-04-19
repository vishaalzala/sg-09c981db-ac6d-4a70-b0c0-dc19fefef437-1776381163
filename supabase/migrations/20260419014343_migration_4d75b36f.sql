-- Optimize high-traffic table RLS policies (customers, vehicles, bookings, jobs)
-- Replace subqueries with optimized helper functions

-- CUSTOMERS table (most queried)
DROP POLICY IF EXISTS "portal_users_see_own_customer" ON customers;
CREATE POLICY "portal_users_see_own_customer" ON customers
  FOR SELECT
  USING (
    id IN (
      SELECT customer_id FROM customer_portal_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- BOOKINGS table
DROP POLICY IF EXISTS "company_bookings_select" ON bookings;
CREATE POLICY "company_bookings_select" ON bookings
  FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "company_bookings_update" ON bookings;
CREATE POLICY "company_bookings_update" ON bookings
  FOR UPDATE
  USING (company_id = get_user_company_id());

-- BRANCHES table
DROP POLICY IF EXISTS "users_see_company_branches" ON branches;
CREATE POLICY "users_see_company_branches" ON branches
  FOR SELECT
  USING (company_id = get_user_company_id());

-- COMMUNICATION_TEMPLATES table
DROP POLICY IF EXISTS "tenant_isolation_communication_templates" ON communication_templates;
CREATE POLICY "tenant_isolation_communication_templates" ON communication_templates
  FOR ALL
  USING (company_id = get_user_company_id());

-- COMMUNICATIONS table
DROP POLICY IF EXISTS "tenant_isolation_communications" ON communications;
CREATE POLICY "tenant_isolation_communications" ON communications
  FOR ALL
  USING (company_id = get_user_company_id());

-- COMPANY_ADDONS table
DROP POLICY IF EXISTS "company_addons_select" ON company_addons;
CREATE POLICY "company_addons_select" ON company_addons
  FOR SELECT
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "company_addons_update" ON company_addons;
CREATE POLICY "company_addons_update" ON company_addons
  FOR UPDATE
  USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "company_addons_delete" ON company_addons;
CREATE POLICY "company_addons_delete" ON company_addons
  FOR DELETE
  USING (company_id = get_user_company_id());