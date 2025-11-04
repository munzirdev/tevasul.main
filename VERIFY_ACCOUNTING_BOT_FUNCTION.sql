-- Verify that the function uses accounting bot (id=3) and not general bot (id=2)
-- Run this to check the function definition

-- Check the function definition
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'notify_accounting_telegram_transaction';

-- Check what bot ID is being used in the function
-- Look for: WHERE id = 3 (should be accounting bot)
-- Should NOT see: WHERE id = 2 (general bot)

-- Also verify the trigger is correct
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'accounting_transactions'
  AND trigger_name LIKE '%telegram%';

-- Verify accounting bot configuration exists
SELECT 
  id,
  bot_token,
  admin_chat_id,
  is_enabled
FROM telegram_config
WHERE id = 3;

-- Check if there are any active sessions in accounting bot
SELECT 
  telegram_chat_id,
  email,
  authenticated_at,
  expires_at,
  is_active
FROM accounting_telegram_auth
WHERE is_active = true;

