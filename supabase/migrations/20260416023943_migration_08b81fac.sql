-- Payment Methods (Custom per Company)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'eftpos', 'credit_card', 'bank_transfer', 'other')),
  is_active BOOLEAN DEFAULT true,
  has_fee BOOLEAN DEFAULT false,
  fee_type TEXT CHECK (fee_type IN ('percentage', 'fixed')),
  fee_amount DECIMAL(10, 2),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_company ON payment_methods(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(company_id, is_active);

-- Split Payment Records (Multiple payments per invoice)
CREATE TABLE IF NOT EXISTS payment_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),
  method_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_splits_payment ON payment_splits(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_splits_method ON payment_splits(payment_method_id);

-- Add columns to existing payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT false;

-- RLS Policies for Payment Methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_methods_select" ON payment_methods;
CREATE POLICY "payment_methods_select" ON payment_methods FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "payment_methods_insert" ON payment_methods;
CREATE POLICY "payment_methods_insert" ON payment_methods FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "payment_methods_update" ON payment_methods;
CREATE POLICY "payment_methods_update" ON payment_methods FOR UPDATE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "payment_methods_delete" ON payment_methods;
CREATE POLICY "payment_methods_delete" ON payment_methods FOR DELETE
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- RLS Policies for Payment Splits
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_splits_select" ON payment_splits;
CREATE POLICY "payment_splits_select" ON payment_splits FOR SELECT
  USING (payment_id IN (SELECT id FROM payments WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));

DROP POLICY IF EXISTS "payment_splits_insert" ON payment_splits;
CREATE POLICY "payment_splits_insert" ON payment_splits FOR INSERT
  WITH CHECK (payment_id IN (SELECT id FROM payments WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())));

-- Default Payment Methods Function
CREATE OR REPLACE FUNCTION create_default_payment_methods(p_company_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO payment_methods (company_id, name, type, display_order, has_fee, fee_type, fee_amount)
  VALUES 
    (p_company_id, 'Cash', 'cash', 1, false, null, null),
    (p_company_id, 'EFTPOS', 'eftpos', 2, false, null, null),
    (p_company_id, 'Credit Card', 'credit_card', 3, true, 'percentage', 1.50),
    (p_company_id, 'Bank Transfer', 'bank_transfer', 4, false, null, null)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;