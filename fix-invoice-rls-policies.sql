-- Fix RLS Policy for Invoices
-- Run this script in your Supabase SQL editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON invoice_items;

-- 2. Create new policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON invoices
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON invoice_items
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Alternative: Create policies that check for admin role
-- Uncomment these if you want to restrict to admin only
/*
CREATE POLICY "Admins can manage invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_user_meta_data->>'role' IS NULL
            )
        )
    );

CREATE POLICY "Admins can manage invoice items" ON invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.raw_user_meta_data->>'role' IS NULL
            )
        )
    );
*/

-- 4. Success message
SELECT 'RLS policies updated successfully! Invoice system should work now.' as message;
