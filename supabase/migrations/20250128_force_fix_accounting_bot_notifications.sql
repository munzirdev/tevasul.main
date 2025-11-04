-- Force fix: Remove old trigger completely and ensure only accounting bot is used
-- Created: 2025-01-28

-- First, drop ALL triggers related to accounting transactions
DROP TRIGGER IF EXISTS trigger_notify_telegram_accounting_transaction ON accounting_transactions;
DROP TRIGGER IF EXISTS accounting_transaction_telegram_notification ON accounting_transactions;
DROP TRIGGER IF EXISTS notify_telegram_on_accounting_transaction ON accounting_transactions;

-- Drop old functions
DROP FUNCTION IF EXISTS notify_telegram_on_accounting_transaction();
DROP FUNCTION IF EXISTS notify_accounting_telegram_transaction();

-- Create the correct function that ONLY uses accounting bot (id=3)
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
  -- IMPORTANT: Use accounting bot (id=3), NOT general bot (id=2)
  SELECT bot_token, admin_chat_id INTO bot_token, admin_chat_id
  FROM telegram_config
  WHERE id = 3 AND is_enabled = true
  LIMIT 1;

  -- If accounting bot is not configured, exit (do NOT fall back to general bot)
  IF bot_token IS NULL OR bot_token = '' THEN
    RAISE WARNING 'Accounting bot (id=3) is not configured or not enabled';
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
      -- Log error but don't fail the transaction
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
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in notify_accounting_telegram_transaction: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with a unique name to avoid conflicts
DROP TRIGGER IF EXISTS accounting_transaction_telegram_notification ON accounting_transactions;

CREATE TRIGGER accounting_transaction_telegram_notification
  AFTER INSERT ON accounting_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_accounting_telegram_transaction();

-- Verify: Check that only accounting bot trigger exists
DO $$
DECLARE
  trigger_count INTEGER;
  wrong_trigger_count INTEGER;
BEGIN
  -- Count triggers on accounting_transactions
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_table = 'accounting_transactions'
    AND trigger_name LIKE '%telegram%';
  
  -- Check if old trigger still exists
  SELECT COUNT(*) INTO wrong_trigger_count
  FROM information_schema.triggers
  WHERE event_object_table = 'accounting_transactions'
    AND trigger_name = 'trigger_notify_telegram_accounting_transaction';
  
  IF wrong_trigger_count > 0 THEN
    RAISE EXCEPTION 'Old trigger still exists! Please manually drop it.';
  END IF;
  
  RAISE NOTICE 'Accounting bot notification trigger created successfully. Total telegram triggers: %', trigger_count;
END $$;

-- Add comment
COMMENT ON FUNCTION notify_accounting_telegram_transaction() IS 
  'Sends telegram notifications to ACCOUNTING BOT ONLY (id=3) when accounting transactions are added. Uses accounting_telegram_auth table for authenticated users. DO NOT use general bot (id=2).';

