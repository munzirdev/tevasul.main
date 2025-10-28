-- Complete Accounting System Restoration Script
-- This script will restore all accounting data and fix any issues

-- Step 1: Check current status
SELECT '=== ACCOUNTING SYSTEM STATUS CHECK ===' as status;

-- Check if tables exist
SELECT 'Checking table existence...' as step;
SELECT table_name, 
       CASE WHEN table_name IN ('accounting_categories', 'accounting_transactions', 'daily_cash_summary') 
            THEN 'EXISTS' 
            ELSE 'MISSING' 
       END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('accounting_categories', 'accounting_transactions', 'daily_cash_summary');

-- Step 2: Check current data
SELECT 'Checking current data...' as step;
SELECT 
  (SELECT COUNT(*) FROM accounting_categories) as categories_count,
  (SELECT COUNT(*) FROM accounting_transactions) as transactions_count,
  (SELECT COUNT(*) FROM daily_cash_summary) as summaries_count;

-- Step 3: Restore categories if missing
SELECT 'Restoring categories...' as step;
INSERT INTO accounting_categories (name_ar, name_en, name_tr, type, description_ar, description_en, description_tr, is_active)
VALUES 
  -- Income Categories
  ('معاملة زواج', 'Marriage Transaction', 'Evlilik İşlemi', 'income', 'رسوم معاملات الزواج', 'Marriage transaction fees', 'Evlilik işlem ücretleri', true),
  ('معاملة تصديق', 'Authentication Transaction', 'Doğrulama İşlemi', 'income', 'رسوم معاملات التصديق', 'Authentication transaction fees', 'Doğrulama işlem ücretleri', true),
  ('ترجمة', 'Translation', 'Çeviri', 'income', 'رسوم خدمات الترجمة', 'Translation service fees', 'Çeviri hizmet ücretleri', true),
  ('خدمات عامة', 'General Services', 'Genel Hizmetler', 'income', 'رسوم الخدمات العامة', 'General service fees', 'Genel hizmet ücretleri', true),
  ('استشارات', 'Consultations', 'Danışmanlık', 'income', 'رسوم الاستشارات', 'Consultation fees', 'Danışmanlık ücretleri', true),
  
  -- Expense Categories
  ('مصاريف المكتب', 'Office Expenses', 'Ofis Giderleri', 'expense', 'مصاريف تشغيل المكتب', 'Office operating expenses', 'Ofis işletme giderleri', true),
  ('فواتير', 'Bills', 'Faturalar', 'expense', 'فواتير الكهرباء والماء والإنترنت', 'Electricity, water, and internet bills', 'Elektrik, su ve internet faturaları', true),
  ('الضرائب', 'Taxes', 'Vergiler', 'expense', 'الضرائب الحكومية', 'Government taxes', 'Devlet vergileri', true),
  ('رواتب', 'Salaries', 'Maaşlar', 'expense', 'رواتب الموظفين', 'Employee salaries', 'Çalışan maaşları', true),
  ('مصاريف تسويق', 'Marketing Expenses', 'Pazarlama Giderleri', 'expense', 'مصاريف التسويق والإعلان', 'Marketing and advertising expenses', 'Pazarlama ve reklam giderleri', true),
  ('صيانة', 'Maintenance', 'Bakım', 'expense', 'مصاريف الصيانة والإصلاح', 'Maintenance and repair expenses', 'Bakım ve onarım giderleri', true),
  ('مصاريف سفر', 'Travel Expenses', 'Seyahat Giderleri', 'expense', 'مصاريف السفر والتنقل', 'Travel and transportation expenses', 'Seyahat ve ulaşım giderleri', true)
ON CONFLICT (name_ar, type) DO NOTHING;

-- Step 4: Check RLS policies
SELECT 'Checking RLS policies...' as step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('accounting_categories', 'accounting_transactions', 'daily_cash_summary')
ORDER BY tablename, policyname;

-- Step 5: Test data access
SELECT 'Testing data access...' as step;
SELECT 'Categories accessible:' as test, COUNT(*) as count FROM accounting_categories;
SELECT 'Transactions accessible:' as test, COUNT(*) as count FROM accounting_transactions;
SELECT 'Summaries accessible:' as test, COUNT(*) as count FROM daily_cash_summary;

-- Step 6: Test functions
SELECT 'Testing functions...' as step;
-- Test the daily summary function
SELECT update_daily_cash_summary() as function_result;

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as status;
SELECT 
  'Categories' as table_name,
  COUNT(*) as record_count,
  'Active' as status
FROM accounting_categories 
WHERE is_active = true
UNION ALL
SELECT 
  'Transactions' as table_name,
  COUNT(*) as record_count,
  'All' as status
FROM accounting_transactions
UNION ALL
SELECT 
  'Daily Summaries' as table_name,
  COUNT(*) as record_count,
  'All' as status
FROM daily_cash_summary;

-- Step 8: Show sample data
SELECT '=== SAMPLE DATA ===' as status;
SELECT 'Sample Categories:' as info;
SELECT name_ar, name_en, type, is_active FROM accounting_categories ORDER BY type, name_ar LIMIT 5;

SELECT 'Sample Transactions:' as info;
SELECT id, type, amount, transaction_date FROM accounting_transactions ORDER BY transaction_date DESC LIMIT 5;

SELECT 'Sample Daily Summaries:' as info;
SELECT date, total_income, total_expense, closing_balance FROM daily_cash_summary ORDER BY date DESC LIMIT 5;

SELECT '=== RESTORATION COMPLETE ===' as status;
