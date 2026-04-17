-- ============================================
-- CRITICAL FIX: Enable RLS on 19 unprotected tables
-- Multi-tenant SaaS pattern: company_id isolation
-- ============================================

-- 1. ROLES (system table - public read, company admin write)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_roles" ON roles
  FOR SELECT USING (true);

-- 2. ROLE_PERMISSIONS (system table - public read)
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_role_permissions" ON role_permissions
  FOR SELECT USING (true);

-- 3. PERMISSIONS (system table - public read)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_permissions" ON permissions
  FOR SELECT USING (true);

-- 4. USER_BRANCHES (company-scoped via users table)
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_branches_select" ON user_branches
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "user_branches_insert" ON user_branches
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "user_branches_update" ON user_branches
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "user_branches_delete" ON user_branches
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 5. CUSTOMER_TAGS (via customers table)
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_tags_select" ON customer_tags
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "customer_tags_insert" ON customer_tags
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "customer_tags_delete" ON customer_tags
  FOR DELETE USING (
    customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 6. VEHICLE_TAGS (via vehicles table)
ALTER TABLE vehicle_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_tags_select" ON vehicle_tags
  FOR SELECT USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "vehicle_tags_insert" ON vehicle_tags
  FOR INSERT WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "vehicle_tags_delete" ON vehicle_tags
  FOR DELETE USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 7. BOOKING_TAGS (via bookings table)
ALTER TABLE booking_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_tags_select" ON booking_tags
  FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "booking_tags_insert" ON booking_tags
  FOR INSERT WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "booking_tags_delete" ON booking_tags
  FOR DELETE USING (
    booking_id IN (
      SELECT id FROM bookings WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 8. JOB_MECHANICS (via jobs table)
ALTER TABLE job_mechanics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_mechanics_select" ON job_mechanics
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_mechanics_insert" ON job_mechanics
  FOR INSERT WITH CHECK (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_mechanics_delete" ON job_mechanics
  FOR DELETE USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 9. JOB_TYPES (direct company_id)
ALTER TABLE job_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_types_select" ON job_types
  FOR SELECT USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "job_types_insert" ON job_types
  FOR INSERT WITH CHECK (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "job_types_update" ON job_types
  FOR UPDATE USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "job_types_delete" ON job_types
  FOR DELETE USING (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- 10. JOB_JOB_TYPES (via jobs table)
ALTER TABLE job_job_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_job_types_select" ON job_job_types
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_job_types_insert" ON job_job_types
  FOR INSERT WITH CHECK (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_job_types_delete" ON job_job_types
  FOR DELETE USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 11. JOB_TAGS (via jobs table)
ALTER TABLE job_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_tags_select" ON job_tags
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_tags_insert" ON job_tags
  FOR INSERT WITH CHECK (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_tags_delete" ON job_tags
  FOR DELETE USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 12. JOB_STATUS_HISTORY (via jobs table)
ALTER TABLE job_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_status_history_select" ON job_status_history
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "job_status_history_insert" ON job_status_history
  FOR INSERT WITH CHECK (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 13. COURTESY_VEHICLE_ASSIGNMENTS (via jobs table)
ALTER TABLE courtesy_vehicle_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courtesy_vehicle_assignments_select" ON courtesy_vehicle_assignments
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "courtesy_vehicle_assignments_insert" ON courtesy_vehicle_assignments
  FOR INSERT WITH CHECK (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "courtesy_vehicle_assignments_update" ON courtesy_vehicle_assignments
  FOR UPDATE USING (
    job_id IN (
      SELECT id FROM jobs WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 14. QUOTE_TAGS (via quotes table)
ALTER TABLE quote_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quote_tags_select" ON quote_tags
  FOR SELECT USING (
    quote_id IN (
      SELECT id FROM quotes WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "quote_tags_insert" ON quote_tags
  FOR INSERT WITH CHECK (
    quote_id IN (
      SELECT id FROM quotes WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "quote_tags_delete" ON quote_tags
  FOR DELETE USING (
    quote_id IN (
      SELECT id FROM quotes WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 15. INVOICE_TAGS (via invoices table)
ALTER TABLE invoice_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_tags_select" ON invoice_tags
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "invoice_tags_insert" ON invoice_tags
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "invoice_tags_delete" ON invoice_tags
  FOR DELETE USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 16. STOCK_ADJUSTMENT_ITEMS (via stock_adjustments → company_id)
ALTER TABLE stock_adjustment_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_adjustment_items_select" ON stock_adjustment_items
  FOR SELECT USING (
    stock_adjustment_id IN (
      SELECT id FROM stock_adjustments WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "stock_adjustment_items_insert" ON stock_adjustment_items
  FOR INSERT WITH CHECK (
    stock_adjustment_id IN (
      SELECT id FROM stock_adjustments WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "stock_adjustment_items_update" ON stock_adjustment_items
  FOR UPDATE USING (
    stock_adjustment_id IN (
      SELECT id FROM stock_adjustments WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 17. WOF_RULE_VERSIONS (system table - public read)
ALTER TABLE wof_rule_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_wof_rule_versions" ON wof_rule_versions
  FOR SELECT USING (true);

-- 18. CUSTOMER_PORTAL_USERS (customer can see own, staff see company)
ALTER TABLE customer_portal_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_users_see_own" ON customer_portal_users
  FOR SELECT USING (
    auth_user_id = auth.uid()
  );

CREATE POLICY "staff_see_company_portal_users" ON customer_portal_users
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "portal_users_insert" ON customer_portal_users
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "portal_users_update" ON customer_portal_users
  FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR customer_id IN (
      SELECT id FROM customers WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 19. INTEGRATION_CREDENTIALS (via integrations → company_id)
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_credentials_select" ON integration_credentials
  FOR SELECT USING (
    integration_id IN (
      SELECT id FROM integrations WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "integration_credentials_insert" ON integration_credentials
  FOR INSERT WITH CHECK (
    integration_id IN (
      SELECT id FROM integrations WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "integration_credentials_update" ON integration_credentials
  FOR UPDATE USING (
    integration_id IN (
      SELECT id FROM integrations WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "integration_credentials_delete" ON integration_credentials
  FOR DELETE USING (
    integration_id IN (
      SELECT id FROM integrations WHERE company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );