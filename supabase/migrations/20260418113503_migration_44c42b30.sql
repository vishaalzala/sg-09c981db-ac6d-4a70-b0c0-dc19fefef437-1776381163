-- ============================================
-- PART 2: CREATE SUPER ADMIN USER
-- ============================================

-- This will be created via the admin panel after auth is set up
-- For now, ensure the infrastructure is ready

-- Create helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.id = auth.uid() 
    AND r.name = 'super_admin'
  );
END;
$$;

-- Update company_subscriptions policies to allow super admin
DROP POLICY IF EXISTS "company_subscriptions_select" ON company_subscriptions;
CREATE POLICY "company_subscriptions_select" ON company_subscriptions
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "company_subscriptions_insert" ON company_subscriptions;
CREATE POLICY "company_subscriptions_insert" ON company_subscriptions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "company_subscriptions_update" ON company_subscriptions;
CREATE POLICY "company_subscriptions_update" ON company_subscriptions
  FOR UPDATE USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

-- Update feature_entitlements policies
DROP POLICY IF EXISTS "feature_entitlements_select" ON feature_entitlements;
CREATE POLICY "feature_entitlements_select" ON feature_entitlements
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "feature_entitlements_insert" ON feature_entitlements;
CREATE POLICY "feature_entitlements_insert" ON feature_entitlements
  FOR INSERT WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "feature_entitlements_update" ON feature_entitlements;
CREATE POLICY "feature_entitlements_update" ON feature_entitlements
  FOR UPDATE USING (is_super_admin());

DROP POLICY IF EXISTS "feature_entitlements_delete" ON feature_entitlements;
CREATE POLICY "feature_entitlements_delete" ON feature_entitlements
  FOR DELETE USING (is_super_admin());