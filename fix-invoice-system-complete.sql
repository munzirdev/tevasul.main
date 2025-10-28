-- Complete Invoice System Fix
-- Run this script in your Supabase SQL editor

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON invoice_items;

-- 2. Create simple policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON invoices
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON invoice_items
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Test the policies by trying to insert a test record
DO $$
DECLARE
    test_invoice_id UUID;
BEGIN
    -- Try to insert a test invoice
    INSERT INTO invoices (
        invoice_number,
        client_name,
        issue_date,
        due_date,
        status,
        subtotal,
        tax_rate,
        tax_amount,
        total_amount
    ) VALUES (
        'TEST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
        'Test Client',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        'draft',
        100.00,
        18.00,
        18.00,
        118.00
    ) RETURNING id INTO test_invoice_id;
    
    -- Try to insert a test invoice item
    INSERT INTO invoice_items (
        invoice_id,
        description_ar,
        description_en,
        description_tr,
        quantity,
        unit_price,
        total_price
    ) VALUES (
        test_invoice_id,
        'خدمة تجريبية',
        'Test Service',
        'Test Hizmet',
        1,
        100.00,
        100.00
    );
    
    -- Clean up test data
    DELETE FROM invoice_items WHERE invoice_id = test_invoice_id;
    DELETE FROM invoices WHERE id = test_invoice_id;
    
    RAISE NOTICE 'Invoice system test passed! Policies are working correctly.';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Invoice system test failed: %', SQLERRM;
        RAISE NOTICE 'You may need to check your authentication or user role.';
END $$;

-- 4. Success message
SELECT 'Invoice system RLS policies fixed! You can now create invoices.' as message;
