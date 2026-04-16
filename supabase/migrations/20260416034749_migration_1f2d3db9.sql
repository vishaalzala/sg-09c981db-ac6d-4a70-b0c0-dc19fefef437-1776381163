-- Discounts (on Quotes and Invoices)
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('quote', 'invoice')),
  entity_id UUID NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  applied_by UUID REFERENCES users(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_discounts_company ON discounts(company_id);
CREATE INDEX idx_discounts_entity ON discounts(entity_type, entity_id);

-- Sales Opportunities (internal upsell tracking)
CREATE TABLE IF NOT EXISTS sales_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_value DECIMAL(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'mentioned', 'quoted', 'deferred', 'approved', 'declined', 'converted')),
  source_type TEXT CHECK (source_type IN ('job', 'quote', 'invoice', 'inspection', 'manual')),
  source_id UUID,
  converted_to_type TEXT CHECK (converted_to_type IN ('quote', 'job', 'invoice')),
  converted_to_id UUID,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sales_opps_company ON sales_opportunities(company_id);
CREATE INDEX idx_sales_opps_customer ON sales_opportunities(customer_id);
CREATE INDEX idx_sales_opps_vehicle ON sales_opportunities(vehicle_id);
CREATE INDEX idx_sales_opps_status ON sales_opportunities(status) WHERE deleted_at IS NULL;

-- Add discount fields to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'none'));
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add discount fields to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'none'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add finish job fields to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS finished_odometer INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS next_service_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS next_service_kms INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS next_service_note TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS wheel_alignment_due DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS wof_due_date DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS follow_up TEXT;

-- RLS Policies for discounts
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discounts_select" ON discounts FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = auth.uid())));

CREATE POLICY "discounts_insert" ON discounts FOR INSERT 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = auth.uid())));

-- RLS Policies for sales_opportunities
ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_opps_select" ON sales_opportunities FOR SELECT 
  USING (company_id IN (SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = auth.uid())) AND deleted_at IS NULL);

CREATE POLICY "sales_opps_insert" ON sales_opportunities FOR INSERT 
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = auth.uid())));

CREATE POLICY "sales_opps_update" ON sales_opportunities FOR UPDATE 
  USING (company_id IN (SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = auth.uid())));

CREATE POLICY "sales_opps_delete" ON sales_opportunities FOR DELETE 
  USING (company_id IN (SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = auth.uid())));