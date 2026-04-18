-- ============================================
-- PART 2: FREE TRIAL PLAN + SUPER ADMIN SETUP (FIXED)
-- ============================================

-- Create Free Trial plan with proper UUID
INSERT INTO subscription_plans (
  id,
  name,
  display_name,
  description,
  price_monthly,
  price_annual,
  max_users,
  max_branches,
  is_active,
  sort_order,
  features
) VALUES (
  'f1ee7a14-0000-0000-0000-000000000001',
  'free_trial',
  '14 Day Free Trial',
  'Full access to all features for 14 days - no credit card required',
  0.00,
  0.00,
  5,
  1,
  true,
  0,
  '{"wof_compliance": true, "marketing": true, "website_builder": true, "loyalty_program": true, "carjam_integration": true}'::jsonb
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  id = EXCLUDED.id;

-- Ensure super_admin role exists
INSERT INTO roles (name, display_name, description, is_system)
VALUES ('super_admin', 'Super Admin', 'Platform administrator with full system access', true)
ON CONFLICT (name) DO NOTHING;

-- Create all necessary permissions for super admin
INSERT INTO permissions (name, display_name, description, category) VALUES
  ('admin:view_dashboard', 'View Admin Dashboard', 'Access to admin dashboard', 'admin'),
  ('admin:manage_companies', 'Manage Companies', 'Create, edit, disable companies', 'admin'),
  ('admin:manage_users', 'Manage Users', 'Create, edit users across all companies', 'admin'),
  ('admin:manage_plans', 'Manage Plans', 'Create, edit subscription plans', 'admin'),
  ('admin:manage_addons', 'Manage Add-ons', 'Create, edit add-ons', 'admin'),
  ('admin:manage_roles', 'Manage Roles', 'Create, edit roles and permissions', 'admin'),
  ('admin:view_audit_logs', 'View Audit Logs', 'Access to system audit logs', 'admin'),
  ('admin:manage_settings', 'Manage Settings', 'Platform-wide settings', 'admin'),
  ('admin:view_reports', 'View Reports', 'Access to admin reports', 'admin'),
  ('admin:impersonate_user', 'Impersonate User', 'Log in as any user for support', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Assign all admin permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'super_admin'),
  p.id
FROM permissions p
WHERE p.category = 'admin'
ON CONFLICT DO NOTHING;

-- Create platform_settings table for trial configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Super admin access to platform settings
CREATE POLICY "super_admin_platform_settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid() AND r.name = 'super_admin'
    )
  );

-- Insert default trial settings
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
  'trial_settings',
  '{
    "trial_duration_days": 14,
    "auto_assign_trial": true,
    "trial_features_all": true,
    "trial_max_users": 5,
    "trial_max_branches": 1
  }'::jsonb,
  'Free trial configuration'
) ON CONFLICT (setting_key) DO NOTHING;

-- Insert signup settings
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
  'signup_settings',
  '{
    "enable_signup": true,
    "require_email_verification": false,
    "default_plan": "free_trial",
    "auto_create_demo_data": false
  }'::jsonb,
  'Signup configuration'
) ON CONFLICT (setting_key) DO NOTHING;

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

-- Update policies to allow super admin access

-- Companies
DROP POLICY IF EXISTS "companies_select_own" ON companies;
CREATE POLICY "companies_select_all" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "companies_insert" ON companies;
CREATE POLICY "companies_insert" ON companies
  FOR INSERT WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "companies_update" ON companies;
CREATE POLICY "companies_update" ON companies
  FOR UPDATE USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

-- Users table - super admin can manage all
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_all" ON users
  FOR SELECT USING (
    id = auth.uid()
    OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    OR is_super_admin()
  );

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_all" ON users
  FOR UPDATE USING (
    id = auth.uid()
    OR is_super_admin()
  );