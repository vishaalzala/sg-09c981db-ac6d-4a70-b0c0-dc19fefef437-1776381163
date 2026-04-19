ALTER TABLE wof_inspections 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';