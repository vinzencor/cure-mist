# 🗄️ Database Setup Guide - From Scratch

## ⚠️ IMPORTANT
Your database doesn't have the required tables yet. Follow these steps to set up the complete database schema.

---

## 📋 Step-by-Step Setup

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **mpaysdxsmxqcivpsprlw**
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

---

### Step 2: Create Database Tables

1. Copy the **ENTIRE** contents of `create-complete-database-schema.sql`
2. Paste into the SQL Editor
3. Click **"Run"** button (or press Ctrl+Enter)
4. You should see: **"Success. No rows returned"**

This creates 8 tables:
- ✅ profiles
- ✅ user_addresses
- ✅ carts
- ✅ cart_items
- ✅ orders (with payment fields!)
- ✅ order_items
- ✅ coupons
- ✅ user_cards

---

### Step 3: Verify Tables Were Created

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 8 tables listed.

---

### Step 4: Set Up Security Policies

1. Click **"New Query"** again
2. Copy the **ENTIRE** contents of `setup-rls-policies.sql`
3. Paste into the SQL Editor
4. Click **"Run"** button
5. You should see: **"Success. No rows returned"**

This enables Row Level Security (RLS) so users can only access their own data.

---

### Step 5: Verify Policies Were Created

Run this query:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

---

### Step 6: Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Find your user account (or create one)
3. Copy your User ID (UUID)
4. Go back to **SQL Editor**
5. Run this query (replace YOUR_USER_ID with your actual UUID):

```sql
-- Make yourself an admin
INSERT INTO profiles (id, is_admin, email)
VALUES ('YOUR_USER_ID', true, 'your-email@example.com')
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
```

Example:
```sql
INSERT INTO profiles (id, is_admin, email)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', true, 'admin@curemist.com')
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
```

---

### Step 7: Test the Database

Run these test queries to make sure everything works:

```sql
-- Test 1: Check orders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Test 2: Try inserting a test order (will fail due to RLS, but that's OK)
-- This just tests the table structure
SELECT 
    'user_id' as field, 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'user_id'
    ) THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
UNION ALL
SELECT 'payment_method', 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method'
    ) THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'razorpay_payment_id', 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'razorpay_payment_id'
    ) THEN '✓ EXISTS' ELSE '✗ MISSING' END;
```

All fields should show **"✓ EXISTS"**

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] All 8 tables exist in database
- [ ] All tables have RLS enabled
- [ ] Policies are created for each table
- [ ] You have an admin user created
- [ ] Orders table has `payment_method` column
- [ ] Orders table has `razorpay_payment_id` column
- [ ] Orders table has `razorpay_order_id` column

---

## 🧪 Test Your Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open the test page**:
   ```
   http://localhost:8080/test-payment-endpoints.html
   ```

3. **Test the endpoints**:
   - Click "Test Server" - should show ✓ Server is running
   - Click "Test Create Order" - should create a Razorpay order
   - Try placing a test order on your website

---

## 🚨 Common Issues

### Issue: "relation 'profiles' does not exist"
**Solution**: You skipped Step 2. Run `create-complete-database-schema.sql`

### Issue: "permission denied for table orders"
**Solution**: You skipped Step 4. Run `setup-rls-policies.sql`

### Issue: "new row violates row-level security policy"
**Solution**: Make sure you're logged in and the user_id matches your auth.uid()

### Issue: "column 'payment_method' does not exist"
**Solution**: The table was created before the fix. Drop and recreate:
```sql
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
-- Then run create-complete-database-schema.sql again
```

---

## 📊 Database Schema Overview

```
auth.users (Supabase built-in)
    ↓
profiles (user info + admin flag)
    ↓
user_addresses (shipping/billing addresses)
    ↓
carts (shopping cart)
    ↓
cart_items (items in cart)
    ↓
orders (completed orders with payment info)
    ↓
order_items (items in each order)

coupons (discount codes)
user_cards (saved payment methods)
```

---

## 🎯 Next Steps

After database setup is complete:

1. ✅ Test COD payment flow
2. ✅ Test Razorpay payment flow
3. ✅ Verify orders are created
4. ✅ Check admin dashboard works
5. ✅ Test coupon codes
6. ✅ Monitor for errors

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify you completed all steps in order
3. Check Supabase logs (Dashboard → Logs)
4. Review the SQL scripts for any syntax errors
5. Make sure you're using the correct project

---

**Last Updated**: 2026-02-11
**Status**: Ready to run
**Estimated Time**: 10-15 minutes

