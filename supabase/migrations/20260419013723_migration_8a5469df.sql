-- Drop all "_opt" duplicate optimization policies (major performance improvement)
DROP POLICY IF EXISTS company_bookings_select_opt ON bookings;
DROP POLICY IF EXISTS company_bookings_insert_opt ON bookings;
DROP POLICY IF EXISTS company_bookings_update_opt ON bookings;

DROP POLICY IF EXISTS company_customers_select_opt ON customers;
DROP POLICY IF EXISTS company_customers_insert_opt ON customers;
DROP POLICY IF EXISTS company_customers_update_opt ON customers;

DROP POLICY IF EXISTS company_invoices_select_opt ON invoices;
DROP POLICY IF EXISTS company_invoices_insert_opt ON invoices;
DROP POLICY IF EXISTS company_invoices_update_opt ON invoices;

DROP POLICY IF EXISTS company_jobs_select_opt ON jobs;
DROP POLICY IF EXISTS company_jobs_insert_opt ON jobs;
DROP POLICY IF EXISTS company_jobs_update_opt ON jobs;

DROP POLICY IF EXISTS company_quotes_select_opt ON quotes;
DROP POLICY IF EXISTS company_quotes_insert_opt ON quotes;
DROP POLICY IF EXISTS company_quotes_update_opt ON quotes;

DROP POLICY IF EXISTS company_vehicles_select_opt ON vehicles;
DROP POLICY IF EXISTS company_vehicles_insert_opt ON vehicles;
DROP POLICY IF EXISTS company_vehicles_update_opt ON vehicles;

DROP POLICY IF EXISTS payment_methods_select_opt ON payment_methods;
DROP POLICY IF EXISTS payment_methods_insert_opt ON payment_methods;
DROP POLICY IF EXISTS payment_methods_update_opt ON payment_methods;
DROP POLICY IF EXISTS payment_methods_delete_opt ON payment_methods;

DROP POLICY IF EXISTS users_select_all_opt ON users;
DROP POLICY IF EXISTS users_insert_opt ON users;
DROP POLICY IF EXISTS users_update_all_opt ON users;

DROP POLICY IF EXISTS companies_select_all_opt ON companies;
DROP POLICY IF EXISTS companies_insert_opt ON companies;
DROP POLICY IF EXISTS companies_update_opt ON companies;

DROP POLICY IF EXISTS profiles_select_opt ON profiles;
DROP POLICY IF EXISTS profiles_insert_opt ON profiles;
DROP POLICY IF EXISTS profiles_update_opt ON profiles;