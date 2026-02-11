-- ============================================
-- Fix Missing is_admin Column in Profiles Table
-- ============================================
-- Run this if you get error: column profiles.is_admin does not exist
-- ============================================

-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set default value for existing rows
UPDATE profiles SET is_admin = FALSE WHERE is_admin IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_admin';

-- ============================================
-- After running this, go back and run setup-rls-policies.sql
-- ============================================

