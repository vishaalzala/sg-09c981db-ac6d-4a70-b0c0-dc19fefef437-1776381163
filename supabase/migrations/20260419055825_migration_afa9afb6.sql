CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_worked DECIMAL(5,2) NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_company" ON timesheets FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE company_id = timesheets.company_id));
CREATE POLICY "insert_own_company" ON timesheets FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE company_id = timesheets.company_id));
CREATE POLICY "update_own_company" ON timesheets FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE company_id = timesheets.company_id));
CREATE POLICY "delete_own_company" ON timesheets FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE company_id = timesheets.company_id));