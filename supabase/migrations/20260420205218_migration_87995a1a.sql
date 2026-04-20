DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'quote_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN quote_id uuid NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'payments'
      AND constraint_name = 'payments_quote_id_fkey'
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_quote_id_fkey
      FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE SET NULL;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_payments_quote_id ON public.payments(quote_id);
END $$;