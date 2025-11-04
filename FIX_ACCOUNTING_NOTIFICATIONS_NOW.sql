-- URGENT FIX: Remove ALL old triggers and functions, create only accounting bot trigger
-- Run this in Supabase SQL Editor immediately

-- Step 1: Drop ALL existing triggers
DROP TRIGGER IF EXISTS trigger_notify_telegram_accounting_transaction ON accounting_transactions;
DROP TRIGGER IF EXISTS accounting_transaction_telegram_notification ON accounting_transactions;
DROP TRIGGER IF EXISTS notify_telegram_on_accounting_transaction ON accounting_transactions;

-- Step 2: Drop ALL existing functions
DROP FUNCTION IF EXISTS notify_telegram_on_accounting_transaction() CASCADE;
DROP FUNCTION IF EXISTS notify_accounting_telegram_transaction() CASCADE;

-- Step 3: Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 4: Create the CORRECT function that ONLY uses accounting bot (id=3)
-- First, ensure the bot token is set correctly in telegram_config
UPDATE telegram_config 
SET bot_token = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0',
    is_enabled = true,
    updated_at = NOW()
WHERE id = 3;

CREATE OR REPLACE FUNCTION notify_accounting_telegram_transaction()
RETURNS TRIGGER AS $$
DECLARE
  bot_token TEXT := '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0';
  admin_chat_id TEXT;
  transaction_type_text TEXT;
  category_name TEXT;
  notification_text TEXT;
  supabase_url TEXT;
  function_url TEXT;
  service_role_key TEXT;
  auth_sessions RECORD;
BEGIN
  -- CRITICAL: Use accounting bot (id=3) with hardcoded token to ensure it always works
  -- Also get admin_chat_id from config if available
  SELECT admin_chat_id INTO admin_chat_id
  FROM telegram_config
  WHERE id = 3
  LIMIT 1;

  -- Get category name
  SELECT COALESCE(name_ar, name_en, name_tr) INTO category_name
  FROM accounting_categories
  WHERE id = NEW.category_id;

  IF category_name IS NULL THEN
    category_name := 'غير محدد';
  END IF;

  -- Set transaction type text
  IF NEW.type = 'income' THEN
    transaction_type_text := 'إيراد';
  ELSE
    transaction_type_text := 'مصروف';
  END IF;

  -- Build notification message
  notification_text := '💰 <b>معاملة محاسبية جديدة</b>' || E'\n\n';
  notification_text := notification_text || '📊 النوع: ' || transaction_type_text || E'\n';
  notification_text := notification_text || '💵 المبلغ: ' || TO_CHAR(NEW.amount, 'FM999,999,999.00') || ' ₺' || E'\n';
  notification_text := notification_text || '📁 الفئة: ' || category_name || E'\n';
  notification_text := notification_text || '📅 التاريخ: ' || TO_CHAR(NEW.transaction_date, 'YYYY-MM-DD') || E'\n';
  
  IF NEW.description_ar IS NOT NULL AND NEW.description_ar != '' THEN
    notification_text := notification_text || '📝 الوصف: ' || NEW.description_ar || E'\n';
  END IF;

  -- Get Supabase URL and service role key
  supabase_url := current_setting('app.supabase_url', true);
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'https://fctvityawavmuethxxix.supabase.co';
  END IF;

  service_role_key := current_setting('app.service_role_key', true);
  IF service_role_key IS NULL OR service_role_key = '' THEN
    service_role_key := '';
  END IF;

  function_url := supabase_url || '/functions/v1/accounting-telegram-notification';

  -- Send notification via edge function to all authenticated admin chats in ACCOUNTING BOT ONLY
  FOR auth_sessions IN
    SELECT telegram_chat_id
    FROM accounting_telegram_auth
    WHERE is_active = true
      AND telegram_chat_id IS NOT NULL
      AND telegram_chat_id != ''
  LOOP
    BEGIN
      -- Send via edge function
      PERFORM net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'bot_token', bot_token,
          'chat_id', auth_sessions.telegram_chat_id,
          'message', notification_text,
          'transaction_id', NEW.id::TEXT,
          'transaction_type', NEW.type,
          'amount', NEW.amount
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error sending telegram notification to accounting bot chat %: %', auth_sessions.telegram_chat_id, SQLERRM;
    END;
  END LOOP;

  -- Also send to admin_chat_id if exists (for accounting bot only)
  IF admin_chat_id IS NOT NULL AND admin_chat_id != '' THEN
    BEGIN
      PERFORM net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'bot_token', bot_token,
          'chat_id', admin_chat_id,
          'message', notification_text,
          'transaction_id', NEW.id::TEXT,
          'transaction_type', NEW.type,
          'amount', NEW.amount
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error sending telegram notification to accounting bot admin chat: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_accounting_telegram_transaction: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger with a unique name
CREATE TRIGGER accounting_transaction_telegram_notification
  AFTER INSERT ON accounting_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_accounting_telegram_transaction();

-- Step 6: Verify - Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'accounting_transactions'
  AND trigger_name LIKE '%telegram%';

-- You should see ONLY: accounting_transaction_telegram_notification
-- You should NOT see: trigger_notify_telegram_accounting_transaction

