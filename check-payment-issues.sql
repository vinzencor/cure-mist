-- ============================================
-- Check for Payment Issues and Failed Orders
-- ============================================
-- Run this SQL in your Supabase SQL Editor to diagnose payment issues
-- ============================================

-- 1. Check if orders table has required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Check for orders with missing payment information
SELECT id, created_at, user_id, total_price, payment_status, payment_method, razorpay_payment_id
FROM orders
WHERE payment_method IS NULL OR payment_status IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check for recent orders (last 7 days)
SELECT 
  id,
  created_at,
  user_id,
  total_price,
  payment_status,
  payment_method,
  order_status,
  razorpay_payment_id
FROM orders
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 4. Count orders by payment method
SELECT 
  payment_method,
  payment_status,
  COUNT(*) as order_count,
  SUM(total_price) as total_amount
FROM orders
GROUP BY payment_method, payment_status
ORDER BY payment_method, payment_status;

-- 5. Check for orders without order items (potential failed orders)
SELECT o.id, o.created_at, o.total_price, o.payment_status, o.payment_method
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE oi.id IS NULL
ORDER BY o.created_at DESC;

-- 6. Check RLS policies on orders table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- ============================================
-- NOTES:
-- ============================================
-- If you find orders with NULL payment_method, run the fix script:
-- UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;
--
-- If you find orders without order_items, those are likely failed orders
-- that need to be investigated and potentially refunded.

