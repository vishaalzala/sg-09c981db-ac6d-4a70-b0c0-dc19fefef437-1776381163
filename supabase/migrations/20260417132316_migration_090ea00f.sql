-- Add missing foreign key indexes (only ones not already present)

-- Role Permissions (already has some from existing work)
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- User Branches
CREATE INDEX IF NOT EXISTS idx_user_branches_user_id ON user_branches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_branches_branch_id ON user_branches(branch_id);

-- Customer Tags
CREATE INDEX IF NOT EXISTS idx_customer_tags_customer_id ON customer_tags(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tags_tag_id ON customer_tags(tag_id);

-- Vehicle Tags
CREATE INDEX IF NOT EXISTS idx_vehicle_tags_vehicle_id ON vehicle_tags(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_tags_tag_id ON vehicle_tags(tag_id);

-- Booking Tags
CREATE INDEX IF NOT EXISTS idx_booking_tags_booking_id ON booking_tags(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_tags_tag_id ON booking_tags(tag_id);

-- Job Mechanics
CREATE INDEX IF NOT EXISTS idx_job_mechanics_job_id ON job_mechanics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_mechanics_user_id ON job_mechanics(user_id);

-- Job Types
CREATE INDEX IF NOT EXISTS idx_job_types_company_id ON job_types(company_id);

-- Job Job Types
CREATE INDEX IF NOT EXISTS idx_job_job_types_job_id ON job_job_types(job_id);
CREATE INDEX IF NOT EXISTS idx_job_job_types_job_type_id ON job_job_types(job_type_id);

-- Job Tags
CREATE INDEX IF NOT EXISTS idx_job_tags_job_id ON job_tags(job_id);
CREATE INDEX IF NOT EXISTS idx_job_tags_tag_id ON job_tags(tag_id);

-- Job Status History (already has idx_job_status_history_job)
CREATE INDEX IF NOT EXISTS idx_job_status_history_changed_by ON job_status_history(changed_by);

-- Quote Tags
CREATE INDEX IF NOT EXISTS idx_quote_tags_quote_id ON quote_tags(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_tags_tag_id ON quote_tags(tag_id);

-- Invoice Tags
CREATE INDEX IF NOT EXISTS idx_invoice_tags_invoice_id ON invoice_tags(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_tags_tag_id ON invoice_tags(tag_id);

-- Stock Adjustment Items
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_stock_adjustment_id ON stock_adjustment_items(stock_adjustment_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_inventory_item_id ON stock_adjustment_items(inventory_item_id);

-- Customer Portal Users (already has idx_portal_users_customer)
CREATE INDEX IF NOT EXISTS idx_customer_portal_users_auth_user_id ON customer_portal_users(auth_user_id);

-- Users (already has idx_users_company)
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Integration Credentials
CREATE INDEX IF NOT EXISTS idx_integration_credentials_integration_id ON integration_credentials(integration_id);

-- Branches (already has idx_branches_company)

-- Company Subscriptions (already has idx_company_subscriptions_company)
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_plan_id ON company_subscriptions(plan_id);

-- Company Addons (already has idx_company_addons_company)
CREATE INDEX IF NOT EXISTS idx_company_addons_addon_id ON company_addons(addon_id);

-- Feature Entitlements (already has idx_feature_entitlements_company)

-- Usage Records (already has multi-column indexes)
CREATE INDEX IF NOT EXISTS idx_usage_records_addon_id ON usage_records(addon_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);

-- Customer Contacts (already has idx_customer_contacts_customer)

-- Customer Notes (already has idx_customer_notes_customer)
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_by ON customer_notes(created_by);

-- Customer Addresses
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);

-- Vehicles (already has most indexes)
CREATE INDEX IF NOT EXISTS idx_vehicles_created_by ON vehicles(created_by);

-- Vehicle Files (already has idx_vehicle_files_vehicle)
CREATE INDEX IF NOT EXISTS idx_vehicle_files_uploaded_by ON vehicle_files(uploaded_by);

-- Tags (already indexed)

-- Bookings (already has most indexes)
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON bookings(created_by);

-- Job Line Items (already has idx_job_line_items_job)

-- Job Attachments (already has idx_job_attachments_job)
CREATE INDEX IF NOT EXISTS idx_job_attachments_uploaded_by ON job_attachments(uploaded_by);

-- Quote Line Items (already has idx_quote_line_items_quote)

-- Quotes (already has most indexes)
CREATE INDEX IF NOT EXISTS idx_quotes_branch_id ON quotes(branch_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_id ON quotes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_quotes_job_id ON quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_approved_by ON quotes(approved_by);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);

-- Invoice Line Items (already has idx_invoice_line_items_invoice)

-- Invoices (already has most indexes)
CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vehicle_id ON invoices(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);

-- Refunds
CREATE INDEX IF NOT EXISTS idx_refunds_company_id ON refunds(company_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refunds_created_by ON refunds(created_by);

-- Credit Notes
CREATE INDEX IF NOT EXISTS idx_credit_notes_company_id ON credit_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice_id ON credit_notes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_customer_id ON credit_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_created_by ON credit_notes(created_by);

-- Supplier Contacts
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier_id ON supplier_contacts(supplier_id);

-- Purchase Orders (already has most)
CREATE INDEX IF NOT EXISTS idx_purchase_orders_branch_id ON purchase_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders(created_by);

-- Inventory Items (already has most)
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON inventory_items(supplier_id);

-- Inventory Movements (already has most)
CREATE INDEX IF NOT EXISTS idx_inventory_movements_branch_id ON inventory_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_by ON inventory_movements(created_by);

-- Stock Adjustments
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_company_id ON stock_adjustments(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_branch_id ON stock_adjustments(branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_by ON stock_adjustments(created_by);

-- WOF Inspection Items (already has idx_wof_inspection_items_inspection)

-- WOF Rechecks (already has idx_wof_rechecks_original)
CREATE INDEX IF NOT EXISTS idx_wof_rechecks_recheck_inspection_id ON wof_rechecks(recheck_inspection_id);
CREATE INDEX IF NOT EXISTS idx_wof_rechecks_repair_job_id ON wof_rechecks(repair_job_id);

-- WOF Compliance Logs (already has most)
CREATE INDEX IF NOT EXISTS idx_wof_compliance_logs_changed_by ON wof_compliance_logs(changed_by);

-- Inspector Certifications (already has most)
CREATE INDEX IF NOT EXISTS idx_inspector_certifications_company_id ON inspector_certifications(company_id);

-- Inspection Equipment (already has idx_inspection_equipment_company)
CREATE INDEX IF NOT EXISTS idx_inspection_equipment_branch_id ON inspection_equipment(branch_id);

-- Equipment Calibrations (already has most)

-- Loyalty Accounts (already has most)

-- Loyalty Transactions (already has idx_loyalty_transactions_account)

-- Payments (already has most)
CREATE INDEX IF NOT EXISTS idx_payments_created_by ON payments(created_by);

-- Jobs (already has most)
CREATE INDEX IF NOT EXISTS idx_jobs_courtesy_vehicle_id ON jobs(courtesy_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_jobs_approved_by ON jobs(approved_by);
CREATE INDEX IF NOT EXISTS idx_jobs_qc_completed_by ON jobs(qc_completed_by);
CREATE INDEX IF NOT EXISTS idx_jobs_signed_off_by ON jobs(signed_off_by);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);

-- WOF Inspections (already has most)
CREATE INDEX IF NOT EXISTS idx_wof_inspections_booking_id ON wof_inspections(booking_id);
CREATE INDEX IF NOT EXISTS idx_wof_inspections_customer_id ON wof_inspections(customer_id);
CREATE INDEX IF NOT EXISTS idx_wof_inspections_repair_job_id ON wof_inspections(repair_job_id);
CREATE INDEX IF NOT EXISTS idx_wof_inspections_original_inspection_id ON wof_inspections(original_inspection_id);
CREATE INDEX IF NOT EXISTS idx_wof_inspections_voided_by ON wof_inspections(voided_by);
CREATE INDEX IF NOT EXISTS idx_wof_inspections_wof_rule_version_id ON wof_inspections(wof_rule_version_id);

-- Website Leads
CREATE INDEX IF NOT EXISTS idx_website_leads_website_id ON website_leads(website_id);
CREATE INDEX IF NOT EXISTS idx_website_leads_converted_customer_id ON website_leads(converted_customer_id);

-- Marketing Campaigns (already has idx_marketing_campaigns_company)
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_by ON marketing_campaigns(created_by);

-- Audit Logs (already has most)

-- Activity Logs (already has most)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- API Usage Logs (already has most)
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);

-- Reminders (already has most)
CREATE INDEX IF NOT EXISTS idx_reminders_created_by ON reminders(created_by);
CREATE INDEX IF NOT EXISTS idx_reminders_template_id ON reminders(template_id);

-- Website Domains (already has most)

-- Import History (already has idx_import_history_company)
CREATE INDEX IF NOT EXISTS idx_import_history_created_by ON import_history(created_by);

-- Reminder Templates (already indexed by company_id via policy)

-- Reminder Logs (already has most)
CREATE INDEX IF NOT EXISTS idx_reminder_logs_template_id ON reminder_logs(template_id);

-- Reminder Settings
CREATE INDEX IF NOT EXISTS idx_reminder_settings_company_id ON reminder_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_reminder_settings_template_id ON reminder_settings(template_id);

-- Document Templates
CREATE INDEX IF NOT EXISTS idx_document_templates_company_id ON document_templates(company_id);

-- Document History (already has idx_document_history_entity)
CREATE INDEX IF NOT EXISTS idx_document_history_company_id ON document_history(company_id);
CREATE INDEX IF NOT EXISTS idx_document_history_created_by ON document_history(created_by);

-- Staff Certifications (already has idx_staff_certifications_user)
CREATE INDEX IF NOT EXISTS idx_staff_certifications_company_id ON staff_certifications(company_id);

-- Timesheet Entries (already has most)
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_company_id ON timesheet_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_approved_by ON timesheet_entries(approved_by);

-- Files (already has idx_files_entity)
CREATE INDEX IF NOT EXISTS idx_files_company_id ON files(company_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);

-- Job Approvals (already has idx_job_approvals_job)
CREATE INDEX IF NOT EXISTS idx_job_approvals_company_id ON job_approvals(company_id);
CREATE INDEX IF NOT EXISTS idx_job_approvals_approved_by ON job_approvals(approved_by);

-- Job Checklists (already has idx_job_checklists_job)
CREATE INDEX IF NOT EXISTS idx_job_checklists_company_id ON job_checklists(company_id);
CREATE INDEX IF NOT EXISTS idx_job_checklists_completed_by ON job_checklists(completed_by);

-- Job Timers (already has idx_job_timers_job)
CREATE INDEX IF NOT EXISTS idx_job_timers_company_id ON job_timers(company_id);
CREATE INDEX IF NOT EXISTS idx_job_timers_user_id ON job_timers(user_id);

-- Communications (already has idx_communications_entity)
CREATE INDEX IF NOT EXISTS idx_communications_company_id ON communications(company_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_by ON communications(created_by);

-- Communication Templates
CREATE INDEX IF NOT EXISTS idx_communication_templates_company_id ON communication_templates(company_id);

-- Social Accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_company_id ON social_accounts(company_id);

-- Social Posts (already has most)
CREATE INDEX IF NOT EXISTS idx_social_posts_account_id ON social_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_by ON social_posts(created_by);

-- Payment Splits (already has both indexes)

-- Discounts (already has idx_discounts_company and idx_discounts_entity)
CREATE INDEX IF NOT EXISTS idx_discounts_applied_by ON discounts(applied_by);

-- Sales Opportunities (already has most)
CREATE INDEX IF NOT EXISTS idx_sales_opportunities_created_by ON sales_opportunities(created_by);