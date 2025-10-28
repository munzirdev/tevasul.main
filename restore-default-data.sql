-- Restore default accounting data
-- This script will insert default categories and sample transactions

-- Insert default categories (only if they don't exist)
INSERT INTO accounting_categories (name_ar, name_en, name_tr, type, description_ar, description_en, description_tr) VALUES
-- Income categories
('معاملة زواج', 'Marriage Transaction', 'Evlilik İşlemi', 'income', 'رسوم معاملة الزواج', 'Marriage transaction fees', 'Evlilik işlemi ücretleri'),
('معاملة تصديق', 'Authentication Transaction', 'Doğrulama İşlemi', 'income', 'رسوم معاملة التصديق', 'Authentication transaction fees', 'Doğrulama işlemi ücretleri'),
('ترجمة', 'Translation', 'Çeviri', 'income', 'رسوم خدمات الترجمة', 'Translation service fees', 'Çeviri hizmet ücretleri'),
('أخرى', 'Other Income', 'Diğer Gelirler', 'income', 'مصادر الدخل الأخرى', 'Other sources of income', 'Diğer gelir kaynakları'),
-- Expense categories
('مصاريف المكتب', 'Office Expenses', 'Ofis Giderleri', 'expense', 'مصاريف المكتب والمواد المكتبية', 'Office supplies and expenses', 'Ofis malzemeleri ve giderleri'),
('فواتير', 'Bills', 'Faturalar', 'expense', 'فواتير الكهرباء والماء والإنترنت', 'Electricity, water, and internet bills', 'Elektrik, su ve internet faturaları'),
('الضرائب', 'Taxes', 'Vergiler', 'expense', 'الضرائب والرسوم الحكومية', 'Government taxes and fees', 'Devlet vergileri ve harçları'),
('أخرى', 'Other Expenses', 'Diğer Giderler', 'expense', 'المصروفات الأخرى', 'Other miscellaneous expenses', 'Diğer çeşitli giderler')
ON CONFLICT (name_ar, type) DO NOTHING;

-- Insert sample transactions for demonstration
-- Get the first category ID for income
WITH income_category AS (
  SELECT id FROM accounting_categories WHERE type = 'income' LIMIT 1
),
expense_category AS (
  SELECT id FROM accounting_categories WHERE type = 'expense' LIMIT 1
)
INSERT INTO accounting_transactions (category_id, type, amount, description_ar, description_en, description_tr, transaction_date) VALUES
-- Sample income transactions
((SELECT id FROM income_category), 'income', 500.00, 'معاملة زواج - أحمد محمد', 'Marriage transaction - Ahmed Mohammed', 'Evlilik işlemi - Ahmed Mohammed', CURRENT_DATE - INTERVAL '2 days'),
((SELECT id FROM income_category), 'income', 300.00, 'معاملة تصديق - فاطمة علي', 'Authentication transaction - Fatima Ali', 'Doğrulama işlemi - Fatima Ali', CURRENT_DATE - INTERVAL '1 day'),
((SELECT id FROM income_category), 'income', 200.00, 'ترجمة وثيقة', 'Document translation', 'Belge çevirisi', CURRENT_DATE),
-- Sample expense transactions
((SELECT id FROM expense_category), 'expense', 150.00, 'شراء مواد مكتبية', 'Office supplies purchase', 'Ofis malzemesi satın alma', CURRENT_DATE - INTERVAL '3 days'),
((SELECT id FROM expense_category), 'expense', 200.00, 'فاتورة الكهرباء', 'Electricity bill', 'Elektrik faturası', CURRENT_DATE - INTERVAL '1 day'),
((SELECT id FROM expense_category), 'expense', 100.00, 'فاتورة الإنترنت', 'Internet bill', 'İnternet faturası', CURRENT_DATE);

-- Update daily summaries for the inserted transactions
-- This will trigger the automatic summary calculation
SELECT update_daily_cash_summary(CURRENT_DATE - INTERVAL '3 days');
SELECT update_daily_cash_summary(CURRENT_DATE - INTERVAL '2 days');
SELECT update_daily_cash_summary(CURRENT_DATE - INTERVAL '1 day');
SELECT update_daily_cash_summary(CURRENT_DATE);

-- Display summary of inserted data
SELECT 
  'Categories' as table_name,
  COUNT(*) as count,
  STRING_AGG(name_ar, ', ') as items
FROM accounting_categories
UNION ALL
SELECT 
  'Transactions' as table_name,
  COUNT(*) as count,
  STRING_AGG(description_ar, ', ') as items
FROM accounting_transactions
UNION ALL
SELECT 
  'Daily Summaries' as table_name,
  COUNT(*) as count,
  STRING_AGG(summary_date::text, ', ') as items
FROM daily_cash_summary;
