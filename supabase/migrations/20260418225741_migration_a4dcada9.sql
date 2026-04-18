-- Create lead_submissions table for contact form submissions
CREATE TABLE IF NOT EXISTS public.lead_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_lead_submissions_email ON public.lead_submissions(email);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_status ON public.lead_submissions(status);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_created_at ON public.lead_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

-- Super admin can view all leads
CREATE POLICY "super_admin_all_access" ON public.lead_submissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Allow anonymous inserts (for contact form)
CREATE POLICY "allow_anonymous_insert" ON public.lead_submissions
  FOR INSERT
  WITH CHECK (true);

SELECT 'Lead submissions table created' as status;