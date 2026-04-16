-- Add RLS policies for company_addons table to allow users to manage their company's add-ons
CREATE POLICY "company_addons_select" ON company_addons
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "company_addons_insert" ON company_addons
  FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "company_addons_update" ON company_addons
  FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "company_addons_delete" ON company_addons
  FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));