-- =============================================================================
-- WEBSITE BUILDER & DOMAINS EXTENSION
-- =============================================================================

-- Extend websites table with new columns
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain TEXT,
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'classic_workshop',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS about_text TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS hours TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS show_booking_form BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_lead_form BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_portal_link BOOLEAN DEFAULT true;

-- Website domains table
CREATE TABLE IF NOT EXISTS website_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  ssl_status TEXT DEFAULT 'pending',
  dns_verified_at TIMESTAMP WITH TIME ZONE,
  ssl_issued_at TIMESTAMP WITH TIME ZONE,
  cloudflare_zone_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(domain)
);

-- Website analytics table
CREATE TABLE IF NOT EXISTS website_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  booking_submissions INTEGER DEFAULT 0,
  lead_submissions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(website_id, date)
);

-- =============================================================================
-- IMPORT / EXPORT HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  file_name TEXT,
  file_url TEXT,
  total_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  field_mapping JSONB,
  errors JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- REMINDER AUTOMATION EXTENSION
-- =============================================================================

-- Reminder templates
CREATE TABLE IF NOT EXISTS reminder_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  days_before INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminder logs
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
  template_id UUID REFERENCES reminder_templates(id),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminder settings per company
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT ARRAY['email'],
  days_before INTEGER DEFAULT 7,
  recurring BOOLEAN DEFAULT false,
  template_id UUID REFERENCES reminder_templates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, reminder_type)
);

-- Extend reminders table
ALTER TABLE reminders
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES reminder_templates(id),
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS opt_out BOOLEAN DEFAULT false;

-- =============================================================================
-- PRINT & EMAIL DOCUMENTS
-- =============================================================================

-- Document templates
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document history
CREATE TABLE IF NOT EXISTS document_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  action TEXT NOT NULL,
  recipient TEXT,
  file_url TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- STAFF & TIMESHEETS
-- =============================================================================

-- Extend users table for staff
ALTER TABLE users
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS availability JSONB;

-- Staff certifications
CREATE TABLE IF NOT EXISTS staff_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  certification_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timesheet entries
CREATE TABLE IF NOT EXISTS timesheet_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  break_minutes INTEGER DEFAULT 0,
  hours_worked DECIMAL(5,2),
  hours_billed DECIMAL(5,2),
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FILES & DOCUMENTS SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- JOB WORKFLOW DEPTH
-- =============================================================================

-- Job approvals
CREATE TABLE IF NOT EXISTS job_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  amount DECIMAL(10,2),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job checklists
CREATE TABLE IF NOT EXISTS job_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job timers
CREATE TABLE IF NOT EXISTS job_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS parts_eta TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qc_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qc_completed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS signed_off_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS signed_off_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- =============================================================================
-- COMMUNICATION CENTER
-- =============================================================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  communication_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sender TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  is_internal BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication templates
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SUPPLIER TO JOB INTEGRATION
-- =============================================================================

-- Extend purchase_orders with job linkage
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- =============================================================================
-- SOCIAL MEDIA ADD-ON
-- =============================================================================

-- Social media accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_id TEXT,
  account_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, platform, account_id)
);

-- Social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_at TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  post_id TEXT,
  engagement_stats JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- WOF WORKFLOW REFINEMENT
-- =============================================================================

-- Extend wof_inspections for authorization info and void
ALTER TABLE wof_inspections
ADD COLUMN IF NOT EXISTS wof_label_serial_number TEXT,
ADD COLUMN IF NOT EXISTS system_authorization_number TEXT,
ADD COLUMN IF NOT EXISTS is_voided BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS void_reason TEXT,
ADD COLUMN IF NOT EXISTS voided_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS voided_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_recheck BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_inspection_id UUID REFERENCES wof_inspections(id),
ADD COLUMN IF NOT EXISTS recheck_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS form_locked BOOLEAN DEFAULT false;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_website_domains_company ON website_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_website_domains_website ON website_domains(website_id);
CREATE INDEX IF NOT EXISTS idx_website_analytics_website_date ON website_analytics(website_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_company ON import_history(company_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder ON reminder_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_company ON reminder_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_document_history_entity ON document_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_staff_certifications_user ON staff_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_user_date ON timesheet_entries(user_id, clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_job ON timesheet_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_job_approvals_job ON job_approvals(job_id);
CREATE INDEX IF NOT EXISTS idx_job_checklists_job ON job_checklists(job_id);
CREATE INDEX IF NOT EXISTS idx_job_timers_job ON job_timers(job_id);
CREATE INDEX IF NOT EXISTS idx_communications_entity ON communications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_company ON social_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_at) WHERE status = 'scheduled';

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Website domains
ALTER TABLE website_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_website_domains" ON website_domains USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Website analytics
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_website_analytics" ON website_analytics USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Import history
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_import_history" ON import_history USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Reminder templates
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_reminder_templates" ON reminder_templates USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Reminder logs
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_reminder_logs" ON reminder_logs USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Reminder settings
ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_reminder_settings" ON reminder_settings USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Document templates
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_document_templates" ON document_templates USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Document history
ALTER TABLE document_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_document_history" ON document_history USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Staff certifications
ALTER TABLE staff_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_staff_certifications" ON staff_certifications USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Timesheet entries
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_timesheet_entries" ON timesheet_entries USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_files" ON files USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Job approvals
ALTER TABLE job_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_job_approvals" ON job_approvals USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Job checklists
ALTER TABLE job_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_job_checklists" ON job_checklists USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Job timers
ALTER TABLE job_timers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_job_timers" ON job_timers USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Communications
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_communications" ON communications USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Communication templates
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_communication_templates" ON communication_templates USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Social accounts
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_social_accounts" ON social_accounts USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Social posts
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_social_posts" ON social_posts USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));