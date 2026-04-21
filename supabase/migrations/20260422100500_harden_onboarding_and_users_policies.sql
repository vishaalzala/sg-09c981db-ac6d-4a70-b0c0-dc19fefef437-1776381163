-- Harden core onboarding access without blocking the owner signup flow

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Make sure company owners can finish setup from the client after auth succeeds.
DROP POLICY IF EXISTS "companies_insert_authenticated" ON public.companies;
CREATE POLICY "companies_insert_authenticated"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('company_owner', 'super_admin')
  )
);

DROP POLICY IF EXISTS "users_insert_self_onboarding" ON public.users;
CREATE POLICY "users_insert_self_onboarding"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_self_onboarding" ON public.users;
CREATE POLICY "users_update_self_onboarding"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_self_trigger_safe" ON public.profiles;
CREATE POLICY "profiles_insert_self_trigger_safe"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
