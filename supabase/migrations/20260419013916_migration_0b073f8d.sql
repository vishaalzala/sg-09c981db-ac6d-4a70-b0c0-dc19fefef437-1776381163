-- Add indexes for unindexed foreign keys (performance improvement)
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_booking_id ON jobs(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method_id ON payments(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by ON platform_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_company_id ON reminder_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_website_analytics_company_id ON website_analytics(company_id);
CREATE INDEX IF NOT EXISTS idx_wof_inspections_branch_id ON wof_inspections(branch_id);

-- Also add company_id indexes for tables used in RLS policies (auth performance)
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);