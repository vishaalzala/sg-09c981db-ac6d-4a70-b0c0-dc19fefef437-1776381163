-- Create reminder_types table
CREATE TABLE IF NOT EXISTS reminder_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_reminder_types_company ON reminder_types(company_id);

ALTER TABLE reminder_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY reminder_types_select ON reminder_types FOR SELECT USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY reminder_types_insert ON reminder_types FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY reminder_types_update ON reminder_types FOR UPDATE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

CREATE POLICY reminder_types_delete ON reminder_types FOR DELETE USING (
  company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
);

-- Add missing columns to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS bill_to_third_party TEXT;

-- Add missing columns to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS hubodometer INTEGER;

-- Add missing columns to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS bill_to_third_party TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS salesperson_id UUID REFERENCES users(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS payment_term TEXT DEFAULT 'COD';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS odometer INTEGER;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS hubodometer INTEGER;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_note TEXT;

CREATE INDEX IF NOT EXISTS idx_quotes_salesperson ON quotes(salesperson_id);

-- Add missing columns to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_to_third_party TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS salesperson_id UUID REFERENCES users(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_term TEXT DEFAULT 'COD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS odometer INTEGER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS hubodometer INTEGER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_note TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_salesperson ON invoices(salesperson_id);

-- Add missing columns to payments (for surcharge handling)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS surcharge_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS surcharge_waived BOOLEAN DEFAULT false;

-- Insert default system reminder types for all companies
INSERT INTO reminder_types (company_id, name, is_system)
SELECT id, 'Service', true FROM companies WHERE NOT EXISTS (
  SELECT 1 FROM reminder_types WHERE company_id = companies.id AND name = 'Service'
);

INSERT INTO reminder_types (company_id, name, is_system)
SELECT id, 'WOF', true FROM companies WHERE NOT EXISTS (
  SELECT 1 FROM reminder_types WHERE company_id = companies.id AND name = 'WOF'
);

INSERT INTO reminder_types (company_id, name, is_system)
SELECT id, 'Wheel Alignment', true FROM companies WHERE NOT EXISTS (
  SELECT 1 FROM reminder_types WHERE company_id = companies.id AND name = 'Wheel Alignment'
);

INSERT INTO reminder_types (company_id, name, is_system)
SELECT id, 'Tyre Rotation', true FROM companies WHERE NOT EXISTS (
  SELECT 1 FROM reminder_types WHERE company_id = companies.id AND name = 'Tyre Rotation'
);