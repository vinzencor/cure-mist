-- ============================================
-- COMPLETE FIX: Add ALL Missing Columns to Orders Table
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Add ALL missing columns to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mrp_total INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount INTEGER DEFAULT 0;

-- Update existing orders to have default values if null
UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;
UPDATE orders SET mrp_total = subtotal WHERE mrp_total IS NULL OR mrp_total = 0;
UPDATE orders SET discount_amount = 0 WHERE discount_amount IS NULL;
UPDATE orders SET coupon_discount = 0 WHERE coupon_discount IS NULL;

-- ============================================
-- Verify ALL columns were added
-- ============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN (
    'payment_method', 
    'razorpay_payment_id', 
    'razorpay_order_id',
    'mrp_total', 
    'discount_amount', 
    'coupon_discount'
  )
ORDER BY column_name;
