-- Quick test to check accounting data
-- Run this in Supabase SQL Editor

-- Check if tables exist
SELECT 'Checking table existence...' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('accounting_categories', 'accounting_transactions', 'daily_cash_summary');

-- Check categories
SELECT 'Current categories:' as status;
SELECT name_ar, name_en, type, is_active FROM accounting_categories ORDER BY type, name_ar;

-- Check transactions
SELECT 'Current transactions:' as status;
SELECT COUNT(*) as transaction_count FROM accounting_transactions;

-- Check daily summaries
SELECT 'Current daily summaries:' as status;
SELECT COUNT(*) as summary_count FROM daily_cash_summary;

-- Test RLS policies
SELECT 'Testing RLS policies...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('accounting_categories', 'accounting_transactions', 'daily_cash_summary');
