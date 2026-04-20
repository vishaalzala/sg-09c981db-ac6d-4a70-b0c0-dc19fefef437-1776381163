DO $$
BEGIN
  ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS bill_to_third_party TEXT;
  ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_company BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS company_name TEXT;
  ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS postal_address TEXT;
  ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS source_of_business TEXT;
END $$;