# 🔧 Database Setup Troubleshooting

## Common Errors and Solutions

### ❌ Error: "column profiles.is_admin does not exist"

**What happened:**
You ran `setup-rls-policies.sql` but the `is_admin` column wasn't created in the profiles table.

**Solution:**
Run this SQL script first:

```sql
-- Add the missing column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set default value for existing rows
UPDATE profiles SET is_admin = FALSE WHERE is_admin IS NULL;
```

Or simply run the file: `fix-missing-is-admin-column.sql`

Then run `setup-rls-policies.sql` again.

---

### ❌ Error: "relation 'orders' does not exist"

**What happened:**
You tried to run `fix-orders-table-schema.sql` but the orders table doesn't exist yet.

**Solution:**
You need to create the tables first. Run `create-complete-database-schema.sql` instead.

---

### ❌ Error: "permission denied for table X"

**What happened:**
Row Level Security (RLS) is blocking your access.

**Solution:**

1. Make sure you're logged in to your application
2. Make sure your user ID matches the data you're trying to access
3. For admin access, run this SQL (replace YOUR_USER_ID):

```sql
-- Make yourself an admin
INSERT INTO profiles (id, is_admin, email)
VALUES ('YOUR_USER_ID', true, 'your-email@example.com')
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
```

To find your user ID:
- Go to Supabase Dashboard → Authentication → Users
- Copy your User ID (UUID)

---

### ❌ Error: "duplicate key value violates unique constraint"

**What happened:**
You're trying to insert data that already exists.

**Solution:**

Use `ON CONFLICT` to update instead of insert:

```sql
INSERT INTO profiles (id, first_name, last_name)
VALUES ('user-id', 'John', 'Doe')
ON CONFLICT (id) 
DO UPDATE SET first_name = 'John', last_name = 'Doe';
```

---

### ❌ Error: "new row violates row-level security policy"

**What happened:**
You're trying to insert data for a different user, or you're not logged in.

**Solution:**

1. **Make sure you're logged in** to your application
2. **Check the user_id** matches your authenticated user:

```sql
-- Check your current user ID
SELECT auth.uid();

-- This should match the user_id you're trying to insert
```

3. **For testing**, you can temporarily disable RLS:

```sql
-- ONLY FOR TESTING - DO NOT USE IN PRODUCTION
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable it:
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

---

### ❌ Error: "syntax error at or near X"

**What happened:**
There's a typo or syntax error in your SQL.

**Solution:**

1. **Copy the ENTIRE script** - don't modify it
2. **Paste it exactly** as-is into SQL Editor
3. **Don't add or remove** any characters
4. **Check for special characters** that might have been corrupted during copy/paste

---

### ❌ Error: "column 'payment_method' does not exist"

**What happened:**
The orders table was created without the payment columns.

**Solution:**

Add the missing columns:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
```

Or run: `fix-orders-table-schema.sql`

---

## 🔍 Diagnostic Queries

### Check if all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected output:** 8 tables (profiles, user_addresses, carts, cart_items, orders, order_items, coupons, user_cards)

---

### Check if all columns exist in orders table:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

**Must include:** payment_method, razorpay_payment_id, razorpay_order_id

---

### Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should have `rowsecurity = true`

---

### Check if policies exist:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

**Expected:** Multiple policies for each table

---

### Check your user ID:

```sql
SELECT auth.uid() as my_user_id;
```

---

### Check if you're an admin:

```sql
SELECT id, email, is_admin 
FROM profiles 
WHERE id = auth.uid();
```

**Expected:** is_admin should be `true` for admin users

---

## 🔄 Start Over (Nuclear Option)

If everything is broken and you want to start fresh:

### ⚠️ WARNING: This deletes ALL data!

```sql
-- Drop all tables (THIS DELETES EVERYTHING!)
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Now run create-complete-database-schema.sql again
-- Then run setup-rls-policies.sql
```

---

## 📋 Correct Setup Order

Follow this exact order:

1. ✅ Run `create-complete-database-schema.sql`
2. ✅ Verify tables were created
3. ✅ Run `fix-missing-is-admin-column.sql` (if needed)
4. ✅ Run `setup-rls-policies.sql`
5. ✅ Verify policies were created
6. ✅ Create admin user
7. ✅ Test with application

---

## 🆘 Still Having Issues?

### Check these:

1. **Are you in the right project?**
   - Verify project name in Supabase dashboard
   - Check URL matches your project

2. **Is your Supabase connection working?**
   - Check `client/lib/supabase.ts`
   - Verify URL and anon key are correct

3. **Are you logged in?**
   - Authentication must work first
   - Test login before testing orders

4. **Is the server running?**
   - Run `npm run dev`
   - Check http://localhost:8080/api/ping

---

## 📞 Quick Reference

| Error | File to Run |
|-------|-------------|
| "relation 'orders' does not exist" | `create-complete-database-schema.sql` |
| "column is_admin does not exist" | `fix-missing-is-admin-column.sql` |
| "column payment_method does not exist" | `fix-orders-table-schema.sql` |
| "permission denied" | Make yourself admin (see above) |
| "row-level security policy" | Check you're logged in |

---

**Last Updated:** 2026-02-11

