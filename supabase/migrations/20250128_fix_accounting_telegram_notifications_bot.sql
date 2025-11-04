-- Fix accounting telegram notifications to use accounting bot (id=3) instead of general bot (id=2)
-- Created: 2025-01-28

-- Drop the old trigger that uses general bot (id=2)
DROP TRIGGER IF EXISTS trigger_notify_telegram_accounting_transaction ON accounting_transactions;

-- Drop the old function that uses general bot
DROP FUNCTION IF EXISTS notify_telegram_on_accounting_transaction();

-- Ensure the new trigger uses accounting bot (id=3)
-- The trigger accounting_transaction_telegram_notification should already exist from previous migration
-- But let's make sure it's using the correct function

-- Verify the correct function exists and uses id=3
-- This function should already exist from 20250128_add_accounting_telegram_notifications.sql
-- But we'll ensure it's correct

CREATE OR REPLACE FUNCTION notify_accounting_telegram_transaction()
RETURNS TRIGGER AS $$
DECLARE
  bot_token TEXT;
  admin_chat_id TEXT;
  transaction_type_text TEXT;
  category_name TEXT;
  notification_text TEXT;
  supabase_url TEXT;
  function_url TEXT;
  service_role_key TEXT;
  auth_sessions RECORD;
BEGIN
  -- Get accounting bot configuration (id=3) - MUST use accounting bot, not general bot
  SELECT bot_token, admin_chat_id INTO bot_token, admin_chat_id
  FROM telegram_config
  WHERE id = 3 AND is_enabled = true
  LIMIT 1;

  -- If bot is not configured, exit
  IF bot_token IS NULL OR bot_token = '' THEN
    RETURN NEW;
  END IF;

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

  -- Send notification via edge function to all authenticated admin chats in accounting bot
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
      -- Log error but don't fail the transaction
      RAISE WARNING 'Error sending telegram notification to accounting bot chat %: %', auth_sessions.telegram_chat_id, SQLERRM;
    END;
  END LOOP;

  -- Also send to admin_chat_id if exists (for accounting bot)
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
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in notify_accounting_telegram_transaction: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists and uses the correct function
DROP TRIGGER IF EXISTS accounting_transaction_telegram_notification ON accounting_transactions;

CREATE TRIGGER accounting_transaction_telegram_notification
  AFTER INSERT ON accounting_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_accounting_telegram_transaction();

-- Add comment to document that this uses accounting bot (id=3)
COMMENT ON FUNCTION notify_accounting_telegram_transaction() IS 
  'Sends telegram notifications to accounting bot (id=3) when accounting transactions are added. Uses accounting_telegram_auth table for authenticated users.';

