-- Add SELECT policy for profiles table if missing
-- This allows authenticated users to read their own profile
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  
  -- Create policy allowing users to read their own profile
  CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);
    
  RAISE NOTICE 'Profile SELECT policy created';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policy already exists';
END $$;

SELECT 'Profile SELECT policy ensured' as status;