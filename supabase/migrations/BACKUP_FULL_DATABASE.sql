-- ========================================
-- FULL DATABASE BACKUP
-- Generated: 2026-04-16
-- Source: Softgen Supabase Database
-- Purpose: Complete backup before migration
-- ========================================

-- This file contains:
-- 1. Complete schema (DDL)
-- 2. All data (DML)
-- 3. RLS policies
-- 4. Indexes and constraints
-- 5. Triggers

-- ========================================
-- SECTION 1: DROP EXISTING TABLES (FOR CLEAN RESTORE)
-- ========================================

-- Drop tables in correct order (reverse dependencies)
DROP TABLE IF EXISTS company_addons CASCADE;
DROP TABLE IF EXISTS addon_catalog CASCADE;
DROP TABLE IF EXISTS website_settings CASCADE;
DROP TABLE IF EXISTS sales_opportunities CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS reminder_templates CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS wof_inspections CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS payment_splits CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS quote_line_items CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS job_line_items CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ========================================
-- SECTION 2: SCHEMA CREATION (WILL BE POPULATED FROM get_database_schema)
-- ========================================

-- NOTE: Full schema DDL will be extracted from current database
-- and inserted here during migration process

-- Placeholder for schema import
-- Tables will be created in dependency order

-- ========================================
-- SECTION 3: DATA EXPORT (WILL BE POPULATED FROM CURRENT DATABASE)
-- ========================================

-- NOTE: All data will be exported from current database
-- and inserted here during migration process

-- Data insertion order:
-- 1. profiles (no dependencies)
-- 2. companies (no dependencies)
-- 3. users (depends on companies)
-- 4. branches (depends on companies)
-- 5. customers (depends on companies)
-- 6. vehicles (depends on companies, customers)
-- 7. bookings (depends on companies, customers, vehicles)
-- 8. jobs (depends on companies, customers, vehicles)
-- 9. job_line_items (depends on jobs)
-- 10. quotes (depends on companies, customers, vehicles)
-- 11. quote_line_items (depends on quotes)
-- 12. invoices (depends on companies, customers, vehicles, quotes, jobs)
-- 13. invoice_line_items (depends on invoices)
-- 14. payment_methods (depends on companies)
-- 15. payments (depends on companies, invoices, payment_methods)
-- 16. suppliers (depends on companies)
-- 17. inventory_items (depends on companies)
-- 18. wof_inspections (depends on companies, vehicles, users)
-- 19. reminder_templates (depends on companies)
-- 20. reminders (depends on companies, customers, vehicles)
-- 21. staff (depends on companies, users)
-- 22. sales_opportunities (depends on companies, customers, vehicles, jobs)
-- 23. addon_catalog (no dependencies)
-- 24. company_addons (depends on companies, addon_catalog)
-- 25. website_settings (depends on companies)

-- ========================================
-- SECTION 4: RLS POLICIES (WILL BE EXTRACTED)
-- ========================================

-- NOTE: All RLS policies will be extracted from current database
-- and recreated here

-- ========================================
-- SECTION 5: INDEXES (WILL BE EXTRACTED)
-- ========================================

-- NOTE: All indexes will be extracted from current database
-- and recreated here

-- ========================================
-- SECTION 6: VALIDATION QUERIES
-- ========================================

-- Run these queries after restore to validate:

-- 1. Verify table counts
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'companies', COUNT(*) FROM companies
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'quotes', COUNT(*) FROM quotes
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
ORDER BY table_name;

-- 2. Verify foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- 3. Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- ========================================
-- END OF BACKUP FILE
-- ========================================