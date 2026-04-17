-- Continue optimizing remaining tables

-- Bookings
DROP POLICY IF EXISTS "users_bookings_select" ON bookings;
DROP POLICY IF EXISTS "users_bookings_insert" ON bookings;
DROP POLICY IF EXISTS "users_bookings_update" ON bookings;
DROP POLICY IF EXISTS "users_bookings_delete" ON bookings;

CREATE POLICY "bookings_select_opt" ON bookings
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "bookings_insert_opt" ON bookings
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "bookings_update_opt" ON bookings
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "bookings_delete_opt" ON bookings
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Jobs
DROP POLICY IF EXISTS "users_jobs_select" ON jobs;
DROP POLICY IF EXISTS "users_jobs_insert" ON jobs;
DROP POLICY IF EXISTS "users_jobs_update" ON jobs;
DROP POLICY IF EXISTS "users_jobs_delete" ON jobs;

CREATE POLICY "jobs_select_opt" ON jobs
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "jobs_insert_opt" ON jobs
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "jobs_update_opt" ON jobs
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "jobs_delete_opt" ON jobs
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Quotes
DROP POLICY IF EXISTS "users_quotes_select" ON quotes;
DROP POLICY IF EXISTS "users_quotes_insert" ON quotes;
DROP POLICY IF EXISTS "users_quotes_update" ON quotes;
DROP POLICY IF EXISTS "users_quotes_delete" ON quotes;

CREATE POLICY "quotes_select_opt" ON quotes
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "quotes_insert_opt" ON quotes
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "quotes_update_opt" ON quotes
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "quotes_delete_opt" ON quotes
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Invoices
DROP POLICY IF EXISTS "users_invoices_select" ON invoices;
DROP POLICY IF EXISTS "users_invoices_insert" ON invoices;
DROP POLICY IF EXISTS "users_invoices_update" ON invoices;
DROP POLICY IF EXISTS "users_invoices_delete" ON invoices;

CREATE POLICY "invoices_select_opt" ON invoices
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "invoices_insert_opt" ON invoices
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "invoices_update_opt" ON invoices
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "invoices_delete_opt" ON invoices
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Suppliers
DROP POLICY IF EXISTS "users_suppliers_select" ON suppliers;
DROP POLICY IF EXISTS "users_suppliers_insert" ON suppliers;
DROP POLICY IF EXISTS "users_suppliers_update" ON suppliers;
DROP POLICY IF EXISTS "users_suppliers_delete" ON suppliers;

CREATE POLICY "suppliers_select_opt" ON suppliers
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "suppliers_insert_opt" ON suppliers
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "suppliers_update_opt" ON suppliers
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "suppliers_delete_opt" ON suppliers
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Tags
DROP POLICY IF EXISTS "tags_select_combined" ON tags;
DROP POLICY IF EXISTS "users_tags_insert" ON tags;
DROP POLICY IF EXISTS "users_tags_update" ON tags;
DROP POLICY IF EXISTS "users_tags_delete" ON tags;

CREATE POLICY "tags_select_opt" ON tags
  FOR SELECT USING (
    company_id = public.current_user_company_id() OR public.is_super_admin()
  );

CREATE POLICY "tags_insert_opt" ON tags
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "tags_update_opt" ON tags
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "tags_delete_opt" ON tags
  FOR DELETE USING (company_id = public.current_user_company_id());

-- WOF Inspections
DROP POLICY IF EXISTS "users_wof_select" ON wof_inspections;
DROP POLICY IF EXISTS "users_wof_insert" ON wof_inspections;
DROP POLICY IF EXISTS "users_wof_update" ON wof_inspections;
DROP POLICY IF EXISTS "users_wof_delete" ON wof_inspections;

CREATE POLICY "wof_inspections_select_opt" ON wof_inspections
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "wof_inspections_insert_opt" ON wof_inspections
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "wof_inspections_update_opt" ON wof_inspections
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "wof_inspections_delete_opt" ON wof_inspections
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Payment Methods
DROP POLICY IF EXISTS "users_payment_methods_select" ON payment_methods;
DROP POLICY IF EXISTS "users_payment_methods_insert" ON payment_methods;
DROP POLICY IF EXISTS "users_payment_methods_update" ON payment_methods;
DROP POLICY IF EXISTS "users_payment_methods_delete" ON payment_methods;

CREATE POLICY "payment_methods_select_opt" ON payment_methods
  FOR SELECT USING (company_id = public.current_user_company_id());

CREATE POLICY "payment_methods_insert_opt" ON payment_methods
  FOR INSERT WITH CHECK (company_id = public.current_user_company_id());

CREATE POLICY "payment_methods_update_opt" ON payment_methods
  FOR UPDATE USING (company_id = public.current_user_company_id());

CREATE POLICY "payment_methods_delete_opt" ON payment_methods
  FOR DELETE USING (company_id = public.current_user_company_id());

-- Customer Portal Users
DROP POLICY IF EXISTS "customer_portal_users_select_combined" ON customer_portal_users;
DROP POLICY IF EXISTS "portal_users_update_own" ON customer_portal_users;

CREATE POLICY "customer_portal_users_select_opt" ON customer_portal_users
  FOR SELECT USING (
    auth_user_id = auth.uid()
    OR customer_id IN (
      SELECT id FROM customers WHERE company_id = public.current_user_company_id()
    )
  );

CREATE POLICY "customer_portal_users_update_opt" ON customer_portal_users
  FOR UPDATE USING (auth_user_id = auth.uid());