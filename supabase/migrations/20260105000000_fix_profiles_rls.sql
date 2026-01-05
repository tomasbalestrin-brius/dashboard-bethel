-- Fix RLS policies for profiles table
-- This allows users to read their own profile data

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;

-- Create new policies
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to read all profiles (for admin operations)
CREATE POLICY "Service role can read all profiles"
  ON profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
