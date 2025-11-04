-- Test and verify accounting bot notifications setup
-- Run this to check everything is configured correctly

-- 1. Verify the function uses accounting bot (id=3)
SELECT 
  'Function check' as check_type,
  CASE 
    WHEN routine_definition LIKE '%id = 3%' THEN '✅ Uses accounting bot (id=3)'
    WHEN routine_definition LIKE '%id = 2%' THEN '❌ ERROR: Uses general bot (id=2)'
    ELSE '⚠️ Could not verify bot ID'
  END as status
FROM information_schema.routines
WHERE routine_name = 'notify_accounting_telegram_transaction';

-- 2. Verify trigger exists
SELECT 
  'Trigger check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Trigger exists: ' || string_agg(trigger_name, ', ')
    ELSE '❌ No trigger found'
  END as status
FROM information_schema.triggers
WHERE event_object_table = 'accounting_transactions'
  AND trigger_name LIKE '%telegram%';

-- 3. Verify accounting bot configuration
SELECT 
  'Bot config check' as check_type,
  CASE 
    WHEN id = 3 AND is_enabled = true AND bot_token IS NOT NULL THEN '✅ Accounting bot (id=3) is configured and enabled'
    WHEN id = 3 AND is_enabled = false THEN '⚠️ Accounting bot (id=3) is configured but disabled'
    WHEN id = 3 AND bot_token IS NULL THEN '❌ Accounting bot (id=3) token is missing'
    ELSE '❌ Accounting bot (id=3) not found'
  END as status
FROM telegram_config
WHERE id = 3;

-- 4. Check active accounting bot sessions
SELECT 
  'Active sessions check' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ ' || COUNT(*) || ' active session(s) in accounting bot'
    ELSE '⚠️ No active sessions - users need to login to accounting bot first'
  END as status
FROM accounting_telegram_auth
WHERE is_active = true;

-- 5. Show active sessions details
SELECT 
  'Active sessions' as check_type,
  telegram_chat_id,
  email,
  authenticated_at,
  expires_at
FROM accounting_telegram_auth
WHERE is_active = true;

-- 6. Verify pg_net extension is enabled
SELECT 
  'Extension check' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN '✅ pg_net extension is enabled'
    ELSE '❌ pg_net extension is NOT enabled - notifications will fail'
  END as status;

-- 7. Final summary
SELECT 
  'SUMMARY' as check_type,
  'To receive notifications, you must:' || E'\n' ||
  '1. Login to accounting bot using /login command' || E'\n' ||
  '2. Make sure accounting bot (id=3) is enabled in telegram_config' || E'\n' ||
  '3. Add a transaction to test notifications' as status;

