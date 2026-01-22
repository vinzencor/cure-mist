-- ============================================
-- Add original_price column to cart_items table
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Add the original_price column to cart_items table
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS original_price INTEGER;

-- ============================================
-- Verify the column was added
-- ============================================
-- Run this to check if the column exists:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'cart_items';
