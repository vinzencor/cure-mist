-- ============================================
-- Supabase RLS Policies for Coupons Management
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- STEP 1: Enable RLS on coupons table
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- STEP 2: Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to read coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to insert coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to update coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to delete coupons" ON coupons;
DROP POLICY IF EXISTS "Allow admin users to manage coupons" ON coupons;

-- STEP 3: Create policies for coupons table
-- Option A: Allow ALL authenticated users to manage coupons (SIMPLE - Use this first)
CREATE POLICY "Allow authenticated users to read coupons"
ON coupons FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert coupons"
ON coupons FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update coupons"
ON coupons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete coupons"
ON coupons FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- ALTERNATIVE: Admin-only policies (RECOMMENDED for production)
-- ============================================
-- Uncomment the section below if you want to restrict to specific admin emails
-- First, comment out or drop the policies above, then use these:

/*
-- Drop the above policies first
DROP POLICY IF EXISTS "Allow authenticated users to read coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to insert coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to update coupons" ON coupons;
DROP POLICY IF EXISTS "Allow authenticated users to delete coupons" ON coupons;

-- Allow only specific admin emails to manage coupons
CREATE POLICY "Allow admin users to manage coupons"
ON coupons FOR ALL
TO authenticated
USING (
  auth.jwt()->>'email' IN (
    'your-admin-email@example.com',
    'another-admin@example.com'
  )
)
WITH CHECK (
  auth.jwt()->>'email' IN (
    'your-admin-email@example.com',
    'another-admin@example.com'
  )
);
*/

-- ============================================
-- OPTIONAL: If you have a profiles or users table with admin role
-- ============================================
/*
-- If you have a profiles table with is_admin column:
CREATE POLICY "Allow admin users to manage coupons"
ON coupons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
*/

-- ============================================
-- Verify policies are created
-- ============================================
-- Run this to check if policies were created successfully:
-- SELECT * FROM pg_policies WHERE tablename = 'coupons';
