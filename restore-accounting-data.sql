-- Script to restore accounting data and check system status
-- This script will check existing data and restore missing categories

-- First, let's check what data exists
SELECT 'Checking existing categories...' as status;
SELECT COUNT(*) as category_count FROM accounting_categories;

SELECT 'Checking existing transactions...' as status;
SELECT COUNT(*) as transaction_count FROM accounting_transactions;

SELECT 'Checking existing daily summaries...' as status;
SELECT COUNT(*) as summary_count FROM daily_cash_summary;

-- Check if categories exist, if not, insert them
INSERT INTO accounting_categories (name_ar, name_en, name_tr, type, description_ar, description_en, description_tr)
VALUES 
  -- Income Categories
  ('معاملة زواج', 'Marriage Transaction', 'Evlilik İşlemi', 'income', 'رسوم معاملات الزواج', 'Marriage transaction fees', 'Evlilik işlem ücretleri'),
  ('معاملة تصديق', 'Authentication Transaction', 'Doğrulama İşlemi', 'income', 'رسوم معاملات التصديق', 'Authentication transaction fees', 'Doğrulama işlem ücretleri'),
  ('ترجمة', 'Translation', 'Çeviri', 'income', 'رسوم خدمات الترجمة', 'Translation service fees', 'Çeviri hizmet ücretleri'),
  ('خدمات عامة', 'General Services', 'Genel Hizmetler', 'income', 'رسوم الخدمات العامة', 'General service fees', 'Genel hizmet ücretleri'),
  ('استشارات', 'Consultations', 'Danışmanlık', 'income', 'رسوم الاستشارات', 'Consultation fees', 'Danışmanlık ücretleri'),
  
  -- Expense Categories
  ('مصاريف المكتب', 'Office Expenses', 'Ofis Giderleri', 'expense', 'مصاريف تشغيل المكتب', 'Office operating expenses', 'Ofis işletme giderleri'),
  ('فواتير', 'Bills', 'Faturalar', 'expense', 'فواتير الكهرباء والماء والإنترنت', 'Electricity, water, and internet bills', 'Elektrik, su ve internet faturaları'),
  ('الضرائب', 'Taxes', 'Vergiler', 'expense', 'الضرائب الحكومية', 'Government taxes', 'Devlet vergileri'),
  ('رواتب', 'Salaries', 'Maaşlar', 'expense', 'رواتب الموظفين', 'Employee salaries', 'Çalışan maaşları'),
  ('مصاريف تسويق', 'Marketing Expenses', 'Pazarlama Giderleri', 'expense', 'مصاريف التسويق والإعلان', 'Marketing and advertising expenses', 'Pazarlama ve reklam giderleri'),
  ('صيانة', 'Maintenance', 'Bakım', 'expense', 'مصاريف الصيانة والإصلاح', 'Maintenance and repair expenses', 'Bakım ve onarım giderleri'),
  ('مصاريف سفر', 'Travel Expenses', 'Seyahat Giderleri', 'expense', 'مصاريف السفر والتنقل', 'Travel and transportation expenses', 'Seyahat ve ulaşım giderleri')
ON CONFLICT (name_ar, type) DO NOTHING;

-- Check the results
SELECT 'Categories after restoration:' as status;
SELECT name_ar, name_en, type FROM accounting_categories ORDER BY type, name_ar;

-- Test the daily summary function
SELECT 'Testing daily summary function...' as status;
SELECT update_daily_cash_summary();

-- Check if RLS policies are working
SELECT 'Checking RLS policies...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('accounting_categories', 'accounting_transactions', 'daily_cash_summary');

-- Final status check
SELECT 'Final system status:' as status;
SELECT 
  (SELECT COUNT(*) FROM accounting_categories) as total_categories,
  (SELECT COUNT(*) FROM accounting_transactions) as total_transactions,
  (SELECT COUNT(*) FROM daily_cash_summary) as total_summaries;
