-- =============================================================================
-- AUTOMOTIVE WORKSHOP SAAS - COMPLETE DATABASE SCHEMA
-- Multi-tenant architecture with company/branch isolation
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CORE SAAS & MULTI-TENANT TABLES
-- =============================================================================

-- Companies (workshops/tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trading_name TEXT,
  business_number TEXT, -- NZ Business Number or AU ABN
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NZ',
  timezone TEXT DEFAULT 'Pacific/Auckland',
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Branches (for multi-location workshops)
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Branch code for reports
  address TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_branches_company ON branches(company_id) WHERE deleted_at IS NULL;

-- Roles (system-wide role definitions)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard roles
INSERT INTO roles (name, display_name, description) VALUES
  ('super_admin', 'Super Admin', 'Platform owner with full access'),
  ('internal_sales', 'Internal Sales/Admin Ops', 'Internal sales and operations'),
  ('company_owner', 'Company Owner', 'Workshop owner with full company access'),
  ('branch_manager', 'Branch Manager', 'Manages specific branch operations'),
  ('service_advisor', 'Service Advisor', 'Front desk, bookings, customer communication'),
  ('technician', 'Technician', 'Performs repairs and services'),
  ('parts_manager', 'Parts Manager', 'Manages inventory and procurement'),
  ('wof_inspector', 'WOF Inspector', 'Performs WOF inspections'),
  ('accountant', 'Accountant', 'Finance and accounting access'),
  ('reception', 'Reception', 'Front desk, check-in'),
  ('customer_portal', 'Customer Portal User', 'Customer-facing portal access');

-- Permissions (granular permission definitions)
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions (many-to-many)
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  email TEXT NOT NULL,
  full_name TEXT,
  mobile TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- User Branches (users can access multiple branches)
CREATE TABLE user_branches (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, branch_id)
);

-- =============================================================================
-- SUBSCRIPTION & BILLING TABLES
-- =============================================================================

-- Subscription Plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  features JSONB, -- Plan features as JSON
  max_users INTEGER,
  max_branches INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, display_name, price_monthly, price_annual, features) VALUES
  ('starter', 'Starter', 99.00, 990.00, '{"users": 3, "branches": 1}'::jsonb),
  ('growth', 'Growth', 249.00, 2490.00, '{"users": 10, "branches": 3}'::jsonb),
  ('pro', 'Pro', 499.00, 4990.00, '{"users": null, "branches": null}'::jsonb);

-- Company Subscriptions
CREATE TABLE company_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due, trialing
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, annual
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_subscriptions_company ON company_subscriptions(company_id);

-- Add-on Catalog
CREATE TABLE addon_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  addon_type TEXT NOT NULL, -- fixed, metered
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  usage_unit TEXT, -- For metered add-ons (e.g., 'lookup', 'sms')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default add-ons
INSERT INTO addon_catalog (name, display_name, addon_type, price_monthly) VALUES
  ('wof_compliance', 'WOF Compliance System', 'fixed', 149.00),
  ('marketing_social', 'Marketing & Social Media', 'fixed', 99.00),
  ('website_builder', 'Website Builder', 'fixed', 79.00),
  ('loyalty_program', 'Loyalty Program', 'fixed', 59.00),
  ('carjam_usage', 'CARJAM Vehicle Lookups', 'metered', 0.00);

-- Company Add-ons (enabled add-ons per company)
CREATE TABLE company_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addon_catalog(id),
  is_enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, addon_id)
);

CREATE INDEX idx_company_addons_company ON company_addons(company_id);

-- Feature Entitlements (derived from plan + add-ons)
CREATE TABLE feature_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  quota_limit INTEGER, -- NULL = unlimited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, feature_name)
);

CREATE INDEX idx_feature_entitlements_company ON feature_entitlements(company_id);

-- Usage Records (for metered billing)
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES addon_catalog(id),
  user_id UUID REFERENCES users(id),
  usage_type TEXT NOT NULL, -- carjam_lookup, sms_sent, etc.
  quantity INTEGER DEFAULT 1,
  metadata JSONB, -- Additional context (e.g., rego looked up)
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ
);

CREATE INDEX idx_usage_records_company_period ON usage_records(company_id, billing_period_start, billing_period_end);
CREATE INDEX idx_usage_records_type ON usage_records(company_id, usage_type);

-- Billing Events (invoices, payments, credits)
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- invoice, payment, credit, refund
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NZD',
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_events_company ON billing_events(company_id, created_at DESC);

-- =============================================================================
-- CRM TABLES
-- =============================================================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_number TEXT, -- Auto-generated customer number
  name TEXT NOT NULL,
  is_company BOOLEAN DEFAULT false,
  mobile TEXT,
  phone TEXT,
  email TEXT,
  postal_address TEXT,
  postal_city TEXT,
  postal_postal_code TEXT,
  physical_address TEXT,
  physical_city TEXT,
  physical_postal_code TEXT,
  source_of_business TEXT,
  notes TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  is_fleet_account BOOLEAN DEFAULT false,
  fleet_billing_contact TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_customers_company ON customers(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_name ON customers(company_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_mobile ON customers(company_id, mobile) WHERE deleted_at IS NULL AND mobile IS NOT NULL;
CREATE INDEX idx_customers_phone ON customers(company_id, phone) WHERE deleted_at IS NULL AND phone IS NOT NULL;
CREATE INDEX idx_customers_email ON customers(company_id, email) WHERE deleted_at IS NULL AND email IS NOT NULL;
CREATE INDEX idx_customers_number ON customers(company_id, customer_number) WHERE deleted_at IS NULL;

-- Customer Contacts (for company customers)
CREATE TABLE customer_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  mobile TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_contacts_customer ON customer_contacts(customer_id);

-- Customer Notes
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_notes_customer ON customer_notes(customer_id, created_at DESC);

-- Customer Addresses (additional addresses)
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_type TEXT, -- billing, shipping, etc.
  address TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NZ',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  registration_number TEXT NOT NULL, -- rego/number plate
  vin TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  body_type TEXT,
  odometer INTEGER,
  odometer_unit TEXT DEFAULT 'km',
  colour TEXT,
  engine_size TEXT,
  transmission TEXT, -- manual, automatic
  fuel_type TEXT, -- petrol, diesel, electric, hybrid
  wof_expiry DATE,
  rego_expiry DATE,
  service_due_date DATE,
  service_due_odometer INTEGER,
  last_service_date DATE,
  last_service_odometer INTEGER,
  is_courtesy_vehicle BOOLEAN DEFAULT false,
  carjam_data JSONB, -- Cached CARJAM lookup data
  carjam_last_fetched TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_vehicles_company ON vehicles(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_rego ON vehicles(company_id, registration_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_vehicles_vin ON vehicles(company_id, vin) WHERE deleted_at IS NULL AND vin IS NOT NULL;
CREATE INDEX idx_vehicles_courtesy ON vehicles(company_id, is_courtesy_vehicle) WHERE deleted_at IS NULL AND is_courtesy_vehicle = true;

-- Vehicle Files (photos, documents)
CREATE TABLE vehicle_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT, -- photo, document, etc.
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_files_vehicle ON vehicle_files(vehicle_id);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- wof_due, service_due, rego_due, wheel_alignment, tyre_rotation, custom
  due_date DATE NOT NULL,
  reminder_note TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, completed, dismissed
  last_sent_at TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT, -- For recurring reminders
  next_scheduled_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_company ON reminders(company_id, due_date);
CREATE INDEX idx_reminders_customer ON reminders(customer_id);
CREATE INDEX idx_reminders_vehicle ON reminders(vehicle_id);
CREATE INDEX idx_reminders_status ON reminders(company_id, status, due_date);

-- Tags (reusable tags for customers, vehicles, jobs, etc.)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- Customer Tags (many-to-many)
CREATE TABLE customer_tags (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (customer_id, tag_id)
);

-- Vehicle Tags (many-to-many)
CREATE TABLE vehicle_tags (
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, tag_id)
);

-- =============================================================================
-- OPERATIONS TABLES
-- =============================================================================

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  booking_number TEXT,
  service_type TEXT,
  description TEXT,
  notes TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  estimated_finish_time TIME,
  pickup_time TIME,
  assigned_mechanic_id UUID REFERENCES users(id),
  courtesy_vehicle_required BOOLEAN DEFAULT false,
  approval_limit DECIMAL(10,2),
  source_of_business TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled, no_show
  is_wof_booking BOOLEAN DEFAULT false,
  wof_booking_type TEXT, -- full_inspection, recheck
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_bookings_company ON bookings(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_branch ON bookings(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_date ON bookings(company_id, booking_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_mechanic ON bookings(assigned_mechanic_id);

-- Booking Tags
CREATE TABLE booking_tags (
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_id, tag_id)
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  job_number TEXT,
  job_title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  customer_visible_notes TEXT,
  internal_notes TEXT,
  invoice_to_third_party BOOLEAN DEFAULT false,
  third_party_name TEXT,
  third_party_contact TEXT,
  third_party_billing_address TEXT,
  start_time TIMESTAMPTZ,
  estimated_finish_time TIMESTAMPTZ,
  pickup_time TIMESTAMPTZ,
  estimated_work_hours DECIMAL(5,2),
  order_number TEXT,
  odometer INTEGER,
  courtesy_vehicle_id UUID REFERENCES vehicles(id),
  source_of_business TEXT,
  status TEXT DEFAULT 'booked', -- booked, checked_in, in_progress, waiting_approval, waiting_parts, paused, ready_for_pickup, completed, invoiced, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_company ON jobs(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_branch ON jobs(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_vehicle ON jobs(vehicle_id);
CREATE INDEX idx_jobs_status ON jobs(company_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_number ON jobs(company_id, job_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_order_number ON jobs(company_id, order_number) WHERE deleted_at IS NULL AND order_number IS NOT NULL;

-- Job Mechanics (many-to-many assignment)
CREATE TABLE job_mechanics (
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (job_id, user_id)
);

-- Job Types (many-to-many)
CREATE TABLE job_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE TABLE job_job_types (
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_type_id UUID REFERENCES job_types(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, job_type_id)
);

-- Job Tags
CREATE TABLE job_tags (
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, tag_id)
);

-- Job Line Items (labour and parts)
CREATE TABLE job_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL, -- labour, part
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 15, -- GST 15%
  line_total DECIMAL(10,2),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_line_items_job ON job_line_items(job_id);

-- Job Attachments (photos, documents)
CREATE TABLE job_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_attachments_job ON job_attachments(job_id);

-- Job Status History (audit trail of status changes)
CREATE TABLE job_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_status_history_job ON job_status_history(job_id, changed_at DESC);

-- Courtesy Vehicles Tracking (which job is using which courtesy vehicle)
CREATE TABLE courtesy_vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  courtesy_vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  returned_at TIMESTAMPTZ
);

CREATE INDEX idx_courtesy_assignments_job ON courtesy_vehicle_assignments(job_id);
CREATE INDEX idx_courtesy_assignments_vehicle ON courtesy_vehicle_assignments(courtesy_vehicle_id);

-- =============================================================================
-- SALES & FINANCE TABLES
-- =============================================================================

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  quote_number TEXT,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  description TEXT,
  notes TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, sent, approved, partially_approved, declined, expired, converted
  approval_status TEXT, -- pending, approved, declined, partial
  decline_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_quotes_company ON quotes(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_number ON quotes(company_id, quote_number) WHERE deleted_at IS NULL;

-- Quote Tags
CREATE TABLE quote_tags (
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (quote_id, tag_id)
);

-- Quote Line Items
CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL, -- labour, part
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 15,
  line_total DECIMAL(10,2),
  is_optional BOOLEAN DEFAULT false,
  is_upsell BOOLEAN DEFAULT false,
  is_approved BOOLEAN, -- For partial approval
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_line_items_quote ON quote_line_items(quote_id);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_number TEXT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  invoice_to_third_party BOOLEAN DEFAULT false,
  third_party_name TEXT,
  third_party_billing_address TEXT,
  notes TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, sent, partial_paid, paid, overdue, cancelled
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_company ON invoices(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_number ON invoices(company_id, invoice_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status ON invoices(company_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_overdue ON invoices(company_id, due_date) WHERE deleted_at IS NULL AND status = 'overdue';

-- Invoice Tags
CREATE TABLE invoice_tags (
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (invoice_id, tag_id)
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 15,
  line_total DECIMAL(10,2),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  payment_number TEXT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- cash, eftpos, credit_card, bank_transfer, online
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  invoice_id UUID REFERENCES invoices(id),
  refund_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Notes
CREATE TABLE credit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),
  credit_note_number TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SUPPLIER & PROCUREMENT TABLES
-- =============================================================================

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  supplier_code TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NZ',
  website TEXT,
  payment_terms TEXT,
  pricing_notes TEXT,
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_suppliers_company ON suppliers(company_id) WHERE deleted_at IS NULL;

-- Supplier Contacts
CREATE TABLE supplier_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  mobile TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  job_id UUID REFERENCES jobs(id),
  po_number TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  delivery_date DATE,
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, sent, confirmed, partial_received, received, cancelled
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_job ON purchase_orders(job_id);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  part_number TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 15,
  line_total DECIMAL(10,2),
  quantity_received DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_items_po ON purchase_order_items(purchase_order_id);

-- =============================================================================
-- INVENTORY TABLES
-- =============================================================================

-- Inventory Items (stock items/parts)
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  part_number TEXT,
  description TEXT NOT NULL,
  category TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  cost_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  tax_rate DECIMAL(5,2) DEFAULT 15,
  reorder_level INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_company ON inventory_items(company_id);
CREATE INDEX idx_inventory_items_part_number ON inventory_items(company_id, part_number);

-- Inventory Stock Levels (per branch)
CREATE TABLE inventory_stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id),
  quantity_on_hand DECIMAL(10,2) DEFAULT 0,
  quantity_reserved DECIMAL(10,2) DEFAULT 0,
  quantity_available DECIMAL(10,2) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inventory_item_id, branch_id)
);

CREATE INDEX idx_stock_levels_item ON inventory_stock_levels(inventory_item_id);
CREATE INDEX idx_stock_levels_branch ON inventory_stock_levels(branch_id);

-- Inventory Movements (stock transactions)
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  branch_id UUID REFERENCES branches(id),
  movement_type TEXT NOT NULL, -- receipt, sale, adjustment, transfer_in, transfer_out
  quantity DECIMAL(10,2) NOT NULL,
  reference_type TEXT, -- purchase_order, job, invoice, adjustment
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_company ON inventory_movements(company_id, created_at DESC);
CREATE INDEX idx_inventory_movements_item ON inventory_movements(inventory_item_id);

-- Stock Adjustments (manual corrections)
CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Adjustment Items
CREATE TABLE stock_adjustment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_adjustment_id UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_before DECIMAL(10,2),
  quantity_after DECIMAL(10,2),
  quantity_change DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- WOF COMPLIANCE TABLES (Add-on Feature)
-- =============================================================================

-- WOF Rule Versions (rules change over time)
CREATE TABLE wof_rule_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_name TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  description TEXT,
  rule_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WOF Inspections
CREATE TABLE wof_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  booking_id UUID REFERENCES bookings(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  customer_id UUID REFERENCES customers(id),
  inspector_id UUID NOT NULL REFERENCES users(id),
  inspection_number TEXT,
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspection_type TEXT NOT NULL, -- full_inspection, recheck
  odometer INTEGER,
  wof_rule_version_id UUID REFERENCES wof_rule_versions(id),
  overall_result TEXT NOT NULL, -- pass, fail
  pass_date DATE,
  expiry_date DATE,
  notes TEXT,
  repair_job_id UUID REFERENCES jobs(id), -- Auto-created repair job if failed
  is_recheck BOOLEAN DEFAULT false,
  original_inspection_id UUID REFERENCES wof_inspections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wof_inspections_company ON wof_inspections(company_id);
CREATE INDEX idx_wof_inspections_vehicle ON wof_inspections(vehicle_id, inspection_date DESC);
CREATE INDEX idx_wof_inspections_inspector ON wof_inspections(inspector_id);
CREATE INDEX idx_wof_inspections_number ON wof_inspections(company_id, inspection_number);

-- WOF Inspection Items (checklist items)
CREATE TABLE wof_inspection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wof_inspection_id UUID NOT NULL REFERENCES wof_inspections(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- brakes, lights, tyres, steering, suspension, etc.
  item_name TEXT NOT NULL,
  result TEXT NOT NULL, -- pass, fail, not_applicable
  fail_reason TEXT,
  notes TEXT,
  photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wof_inspection_items_inspection ON wof_inspection_items(wof_inspection_id);

-- WOF Rechecks
CREATE TABLE wof_rechecks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_inspection_id UUID NOT NULL REFERENCES wof_inspections(id),
  recheck_inspection_id UUID REFERENCES wof_inspections(id),
  repair_job_id UUID REFERENCES jobs(id),
  recheck_due_date DATE,
  recheck_completed_date DATE,
  recheck_result TEXT, -- pass, fail
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wof_rechecks_original ON wof_rechecks(original_inspection_id);

-- WOF Compliance Logs (tamper-resistant audit trail)
CREATE TABLE wof_compliance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  wof_inspection_id UUID REFERENCES wof_inspections(id),
  log_type TEXT NOT NULL, -- inspection_created, inspection_updated, result_changed, recheck_completed
  changed_by UUID REFERENCES users(id),
  change_summary TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wof_compliance_logs_company ON wof_compliance_logs(company_id, logged_at DESC);
CREATE INDEX idx_wof_compliance_logs_inspection ON wof_compliance_logs(wof_inspection_id);

-- Inspector Certifications
CREATE TABLE inspector_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  certification_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  certification_body TEXT,
  document_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspector_certifications_user ON inspector_certifications(user_id);
CREATE INDEX idx_inspector_certifications_expiry ON inspector_certifications(company_id, expiry_date);

-- Inspection Equipment (brake testers, headlight testers, etc.)
CREATE TABLE inspection_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  equipment_type TEXT NOT NULL, -- brake_tester, headlight_tester, emissions_tester
  equipment_name TEXT NOT NULL,
  serial_number TEXT,
  manufacturer TEXT,
  model TEXT,
  purchase_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspection_equipment_company ON inspection_equipment(company_id);

-- Equipment Calibrations
CREATE TABLE equipment_calibrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES inspection_equipment(id) ON DELETE CASCADE,
  calibration_date DATE NOT NULL,
  next_calibration_due DATE NOT NULL,
  calibrated_by TEXT,
  certification_number TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_equipment_calibrations_equipment ON equipment_calibrations(equipment_id);
CREATE INDEX idx_equipment_calibrations_due ON equipment_calibrations(next_calibration_due);

-- =============================================================================
-- CUSTOMER PORTAL & LOYALTY TABLES
-- =============================================================================

-- Customer Portal Users
CREATE TABLE customer_portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_users_customer ON customer_portal_users(customer_id);

-- Loyalty Accounts
CREATE TABLE loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  account_number TEXT,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier_level TEXT, -- bronze, silver, gold, platinum
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, customer_id)
);

CREATE INDEX idx_loyalty_accounts_company ON loyalty_accounts(company_id);
CREATE INDEX idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);

-- Loyalty Transactions
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loyalty_account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- earned, redeemed, expired, adjusted
  points INTEGER NOT NULL,
  reference_type TEXT, -- invoice, referral, bonus
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_account ON loyalty_transactions(loyalty_account_id, created_at DESC);

-- =============================================================================
-- MARKETING & WEBSITE BUILDER TABLES (Add-on Features)
-- =============================================================================

-- Marketing Campaigns
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT, -- wof_reminder, service_reminder, promotional, newsletter
  target_audience_filter JSONB, -- Filter criteria for targeting
  message_template TEXT,
  send_via TEXT[], -- email, sms, both
  scheduled_send_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, sent, cancelled
  recipients_count INTEGER,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_campaigns_company ON marketing_campaigns(company_id);

-- Websites (website builder add-on)
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  domain TEXT,
  subdomain TEXT,
  template_name TEXT,
  template_data JSONB, -- Template configuration and content
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_websites_company ON websites(company_id);

-- Website Leads (from website booking/contact forms)
CREATE TABLE website_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id),
  lead_type TEXT, -- booking_request, contact_inquiry, wof_booking
  name TEXT,
  email TEXT,
  mobile TEXT,
  registration_number TEXT,
  message TEXT,
  metadata JSONB,
  status TEXT DEFAULT 'new', -- new, contacted, converted, closed
  converted_customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_website_leads_company ON website_leads(company_id, status);

-- =============================================================================
-- SYSTEM & AUDIT TABLES
-- =============================================================================

-- Audit Logs (comprehensive audit trail)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  action_type TEXT NOT NULL, -- create, update, delete, merge, move, login, etc.
  entity_type TEXT NOT NULL, -- customer, vehicle, job, invoice, etc.
  entity_id UUID,
  changes JSONB, -- Before/after data
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Activity Logs (user activity feed)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_company ON activity_logs(company_id, created_at DESC);

-- Integrations (third-party integrations)
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- carjam, partstrader, xero, windcave, etc.
  is_enabled BOOLEAN DEFAULT false,
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  config JSONB, -- Integration-specific configuration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, integration_type)
);

CREATE INDEX idx_integrations_company ON integrations(company_id);

-- Integration Credentials (encrypted API keys, tokens)
CREATE TABLE integration_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL, -- api_key, oauth_token, etc.
  credential_value TEXT NOT NULL, -- Should be encrypted
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Logs (for external API calls like CARJAM)
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  api_type TEXT NOT NULL, -- carjam, etc.
  endpoint TEXT,
  request_data JSONB,
  response_status INTEGER,
  response_data JSONB,
  usage_recorded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_usage_logs_company ON api_usage_logs(company_id, created_at DESC);
CREATE INDEX idx_api_usage_logs_type ON api_usage_logs(company_id, api_type);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- All tenant-scoped tables need company_id isolation
-- =============================================================================

-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wof_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wof_inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wof_rechecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wof_compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspector_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (template - user must be authenticated and belong to company)
-- Companies: Users can only see their own company
CREATE POLICY "users_see_own_company" ON companies FOR SELECT USING (
  auth.uid() IN (SELECT id FROM users WHERE company_id = companies.id)
);

-- Branches: Users can only see branches of their company
CREATE POLICY "users_see_company_branches" ON branches FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Users: Can see users in their company
CREATE POLICY "users_see_company_users" ON users FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Generic tenant isolation policy for most tables with company_id
-- (Apply similar pattern to all tenant tables)

-- Customers
CREATE POLICY "company_customers_select" ON customers FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_customers_insert" ON customers FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_customers_update" ON customers FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Vehicles
CREATE POLICY "company_vehicles_select" ON vehicles FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_vehicles_insert" ON vehicles FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_vehicles_update" ON vehicles FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Bookings
CREATE POLICY "company_bookings_select" ON bookings FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_bookings_insert" ON bookings FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_bookings_update" ON bookings FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Jobs
CREATE POLICY "company_jobs_select" ON jobs FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_jobs_insert" ON jobs FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_jobs_update" ON jobs FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Quotes
CREATE POLICY "company_quotes_select" ON quotes FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_quotes_insert" ON quotes FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_quotes_update" ON quotes FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Invoices
CREATE POLICY "company_invoices_select" ON invoices FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_invoices_insert" ON invoices FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "company_invoices_update" ON invoices FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Apply similar policies to other tenant tables (suppliers, inventory, WOF, etc.)

-- Customer Portal: Special policies for customer portal users
CREATE POLICY "portal_users_see_own_customer" ON customers FOR SELECT USING (
  id IN (SELECT customer_id FROM customer_portal_users WHERE auth_user_id = auth.uid())
);

-- Subscription plans and add-on catalog are public read
CREATE POLICY "public_read_plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "public_read_addons" ON addon_catalog FOR SELECT USING (true);