-- Continue optimizing more tables with company_id checks

-- BOOKING_TAGS table (nested subquery - more complex)
DROP POLICY IF EXISTS "booking_tags_select" ON booking_tags;
CREATE POLICY "booking_tags_select" ON booking_tags
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE company_id = get_user_company_id()
    )
  );

DROP POLICY IF EXISTS "booking_tags_delete" ON booking_tags;
CREATE POLICY "booking_tags_delete" ON booking_tags
  FOR DELETE
  USING (
    booking_id IN (
      SELECT id FROM bookings 
      WHERE company_id = get_user_company_id()
    )
  );

-- CUSTOMER_TAGS table (nested subquery)
DROP POLICY IF EXISTS "customer_tags_select" ON customer_tags;
CREATE POLICY "customer_tags_select" ON customer_tags
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE company_id = get_user_company_id()
    )
  );

DROP POLICY IF EXISTS "customer_tags_delete" ON customer_tags;
CREATE POLICY "customer_tags_delete" ON customer_tags
  FOR DELETE
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE company_id = get_user_company_id()
    )
  );

-- COURTESY_VEHICLE_ASSIGNMENTS table (nested subquery)
DROP POLICY IF EXISTS "courtesy_vehicle_assignments_select" ON courtesy_vehicle_assignments;
CREATE POLICY "courtesy_vehicle_assignments_select" ON courtesy_vehicle_assignments
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs 
      WHERE company_id = get_user_company_id()
    )
  );

DROP POLICY IF EXISTS "courtesy_vehicle_assignments_update" ON courtesy_vehicle_assignments;
CREATE POLICY "courtesy_vehicle_assignments_update" ON courtesy_vehicle_assignments
  FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM jobs 
      WHERE company_id = get_user_company_id()
    )
  );