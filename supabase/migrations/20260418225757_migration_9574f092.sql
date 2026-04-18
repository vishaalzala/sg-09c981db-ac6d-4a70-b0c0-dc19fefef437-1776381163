-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON public.testimonials(is_active, display_order);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public read for active testimonials
CREATE POLICY "public_read_active" ON public.testimonials
  FOR SELECT
  USING (is_active = true);

-- Super admin full access
CREATE POLICY "super_admin_all_access" ON public.testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, company_name, role, content, rating, display_order) VALUES
  ('Mike Thompson', 'Auckland Auto Service', 'Owner', 'WorkshopPro has completely transformed how we run our business. The booking system alone saves us 10 hours a week, and our customers love the automated reminders.', 5, 1),
  ('Sarah Chen', 'Precision Motors', 'Service Manager', 'We switched from paper-based systems 6 months ago and haven''t looked back. The WOF compliance features are brilliant - everything is digital and NZTA-approved.', 5, 2),
  ('David Williams', 'Fleet Solutions Ltd', 'Director', 'Managing 50+ fleet vehicles used to be a nightmare. Now with WorkshopPro, we track every service, part, and cost in one place. The reporting features have saved us thousands.', 5, 3),
  ('Emma Robertson', 'Coastline Automotive', 'Owner', 'The customer portal was a game-changer for us. Our clients can now book online, view their service history, and get quotes 24/7. Customer satisfaction is through the roof!', 5, 4),
  ('James Parker', 'North Shore Tyres', 'Manager', 'Best investment we''ve made in years. The inventory management keeps our stock levels perfect, and the automated reordering has eliminated stock-outs completely.', 5, 5),
  ('Lisa Anderson', 'Wellington Workshop', 'Owner', 'After trying 3 different systems, WorkshopPro is the only one that actually does everything we need. It''s intuitive, fast, and their support team is outstanding.', 5, 6)
ON CONFLICT DO NOTHING;

SELECT 'Testimonials table created and seeded' as status;