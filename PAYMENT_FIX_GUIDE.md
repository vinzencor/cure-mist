# Payment Issue Fix Guide

## Problem Summary
Money is being debited from customer accounts but orders are not being created in the database due to:
1. Missing database columns in the `orders` table
2. Insufficient error handling in the payment flow
3. Potential API endpoint issues

## Step-by-Step Fix Instructions

### Step 1: Fix Database Schema (CRITICAL - DO THIS FIRST)

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Run the SQL script from `fix-orders-table-schema.sql`:

```sql
-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Update existing orders to have default payment_method if null
UPDATE orders SET payment_method = 'cod' WHERE payment_method IS NULL;
```

4. Verify the columns were added by running:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

### Step 2: Verify RLS Policies

Make sure your `orders` table has proper Row Level Security policies:

```sql
-- Allow authenticated users to insert their own orders
CREATE POLICY IF NOT EXISTS "Users can insert their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own orders
CREATE POLICY IF NOT EXISTS "Users can read their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Step 3: Check Server is Running

Make sure your Express server is running and accessible:

1. Check if the server is running on the correct port
2. Verify the Razorpay API endpoints are registered:
   - `/api/create-razorpay-order`
   - `/api/verify-razorpay-payment`

3. Test the endpoints manually:
```bash
# Test create order endpoint
curl -X POST http://localhost:8080/api/create-razorpay-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR"}'
```

### Step 4: Monitor Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try placing an order
4. Look for these log messages:
   - "Creating Razorpay order with amount: X"
   - "Razorpay order response: {...}"
   - "Payment successful, verifying..."
   - "Verification response: {...}"
   - "Saving order to database..."
   - "Order created successfully: {...}"

### Step 5: Common Issues and Solutions

#### Issue: 406 Error on create-razorpay-order
**Solution**: Check if your server is running and CORS is properly configured

#### Issue: 400 Error "Invalid amount"
**Solution**: Verify that `totalPrice` is a valid number > 0. Check the console logs.

#### Issue: 400 Error on Supabase orders insert
**Solution**: 
- Run the database schema fix (Step 1)
- Check RLS policies (Step 2)
- Verify all required fields are being sent

#### Issue: Payment succeeds but order not created
**Solution**: 
- Check browser console for errors in `saveOrderToSupabase`
- Verify database columns exist
- Check RLS policies allow insert

### Step 6: Testing the Fix

1. **Test COD Payment**:
   - Add items to cart
   - Go to checkout
   - Select "Cash on Delivery"
   - Fill in all required fields
   - Click "Place Order (COD)"
   - Verify order appears in your profile

2. **Test Razorpay Payment** (use test mode first):
   - Add items to cart
   - Go to checkout
   - Select "Pay Online"
   - Fill in all required fields
   - Click "Pay ₹X Now"
   - Complete payment in Razorpay modal
   - Verify order appears in your profile

### Step 7: Refund Process for Failed Orders

If customers have been charged but orders weren't created:

1. **Identify affected payments**:
   - Log into Razorpay Dashboard
   - Go to Transactions > Payments
   - Filter by date range when issue occurred
   - Look for successful payments without corresponding orders

2. **Process refunds**:
   - For each affected payment, click "Refund"
   - Enter full amount
   - Add reason: "Order creation failed - technical issue"
   - Process refund

3. **Contact affected customers**:
   - Inform them of the technical issue
   - Confirm refund has been processed
   - Offer discount code for inconvenience

### Step 8: Monitoring Going Forward

Add monitoring to track:
- Payment success rate
- Order creation success rate
- Failed payment verifications
- Database insertion errors

Check logs regularly for:
- "Order creation error:"
- "Payment verification error:"
- "Failed to create order:"

## Files Modified

1. `client/pages/checkout.tsx` - Added comprehensive error handling and logging
2. `fix-orders-table-schema.sql` - Database schema fix
3. `server/routes/razorpay.ts` - Already has proper error handling

## Need Help?

If issues persist after following these steps:
1. Check all console logs in browser
2. Check server logs
3. Verify Razorpay credentials are correct
4. Ensure Supabase connection is working
5. Test with Razorpay test mode first before going live

