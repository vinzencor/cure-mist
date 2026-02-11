-- ============================================
-- Fix Orders Table Schema for Razorpay Integration
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Add missing columns to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Update existing orders to have default payment_method if null
UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;

-- ============================================
-- Verify the columns were added
-- ============================================
-- Run this to check if columns exist:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;

