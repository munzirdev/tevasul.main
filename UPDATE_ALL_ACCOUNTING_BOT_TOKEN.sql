-- تحديث جميع إشعارات المحاسبة لاستخدام معرف البوت: 8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0
-- Run this in Supabase SQL Editor

-- Step 1: Update telegram_config to ensure bot is enabled with correct token
UPDATE telegram_config 
SET bot_token = '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0',
    is_enabled = true,
    updated_at = NOW()
WHERE id = 3;

-- Step 2: Update notify_accounting_telegram_transaction function to use hardcoded token
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
  -- Use hardcoded accounting bot token to ensure it always works
  -- Get admin_chat_id from config if available
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

-- Step 3: Update send_accounting_daily_report function to use hardcoded token
CREATE OR REPLACE FUNCTION send_accounting_daily_report()
RETURNS void AS $$
DECLARE
  bot_token TEXT := '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0';
  admin_chat_id TEXT;
  report_date DATE;
  total_income DECIMAL;
  total_expense DECIMAL;
  net_profit DECIMAL;
  transaction_count INTEGER;
  report_text TEXT;
  supabase_url TEXT;
  function_url TEXT;
  service_role_key TEXT;
  auth_sessions RECORD;
BEGIN
  -- Use hardcoded accounting bot token to ensure it always works
  -- Get admin_chat_id from config if available
  SELECT admin_chat_id INTO admin_chat_id
  FROM telegram_config
  WHERE id = 3
  LIMIT 1;

  -- Use yesterday's date for daily report
  report_date := CURRENT_DATE - INTERVAL '1 day';

  -- Get summary for the date
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO total_income, total_expense, transaction_count
  FROM accounting_transactions
  WHERE transaction_date = report_date;

  net_profit := total_income - total_expense;

  -- Build report message
  report_text := '📊 <b>تقرير يومي - المحاسبة</b>' || E'\n\n';
  report_text := report_text || '📅 التاريخ: ' || TO_CHAR(report_date, 'YYYY-MM-DD') || E'\n\n';
  report_text := report_text || '📈 إجمالي الإيرادات: ' || TO_CHAR(total_income, 'FM999,999,999.00') || ' ₺' || E'\n';
  report_text := report_text || '📉 إجمالي المصروفات: ' || TO_CHAR(total_expense, 'FM999,999,999.00') || ' ₺' || E'\n';
  report_text := report_text || '💵 صافي الربح: ' || TO_CHAR(net_profit, 'FM999,999,999.00') || ' ₺' || E'\n';
  report_text := report_text || '📋 عدد المعاملات: ' || transaction_count::TEXT;

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

  -- Send report to all authenticated admin chats
  FOR auth_sessions IN
    SELECT telegram_chat_id
    FROM accounting_telegram_auth
    WHERE is_active = true
      AND telegram_chat_id IS NOT NULL
      AND telegram_chat_id != ''
  LOOP
    BEGIN
      PERFORM net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'bot_token', bot_token,
          'chat_id', auth_sessions.telegram_chat_id,
          'message', report_text,
          'report_type', 'daily'
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error sending daily report to %: %', auth_sessions.telegram_chat_id, SQLERRM;
    END;
  END LOOP;

  -- Also send to admin_chat_id if exists
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
          'message', report_text,
          'report_type', 'daily'
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error sending daily report to admin chat: %', SQLERRM;
    END;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in send_accounting_daily_report: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update send_accounting_monthly_report function to use hardcoded token
CREATE OR REPLACE FUNCTION send_accounting_monthly_report(target_month INTEGER DEFAULT NULL, target_year INTEGER DEFAULT NULL)
RETURNS void AS $$
DECLARE
  bot_token TEXT := '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0';
  admin_chat_id TEXT;
  report_month INTEGER;
  report_year INTEGER;
  start_date DATE;
  end_date DATE;
  total_income DECIMAL;
  total_expense DECIMAL;
  net_profit DECIMAL;
  transaction_count INTEGER;
  report_text TEXT;
  supabase_url TEXT;
  function_url TEXT;
  service_role_key TEXT;
  auth_sessions RECORD;
  month_names TEXT[] := ARRAY['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
BEGIN
  -- Use hardcoded accounting bot token to ensure it always works
  -- Get admin_chat_id from config if available
  SELECT admin_chat_id INTO admin_chat_id
  FROM telegram_config
  WHERE id = 3
  LIMIT 1;

  -- Use provided month/year or last month
  IF target_month IS NULL THEN
    report_month := EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month');
  ELSE
    report_month := target_month;
  END IF;

  IF target_year IS NULL THEN
    report_year := EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month');
  ELSE
    report_year := target_year;
  END IF;

  start_date := DATE_TRUNC('month', MAKE_DATE(report_year, report_month, 1))::DATE;
  end_date := (DATE_TRUNC('month', MAKE_DATE(report_year, report_month, 1)) + INTERVAL '1 month - 1 day')::DATE;

  -- Get summary for the month
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    COUNT(*)
  INTO total_income, total_expense, transaction_count
  FROM accounting_transactions
  WHERE transaction_date >= start_date AND transaction_date <= end_date;

  net_profit := total_income - total_expense;

  -- Build report message
  report_text := '📊 <b>تقرير شهري - المحاسبة</b>' || E'\n\n';
  report_text := report_text || '📅 الشهر: ' || month_names[report_month] || ' ' || report_year || E'\n\n';
  report_text := report_text || '📈 إجمالي الإيرادات: ' || TO_CHAR(total_income, 'FM999,999,999.00') || ' ₺' || E'\n';
  report_text := report_text || '📉 إجمالي المصروفات: ' || TO_CHAR(total_expense, 'FM999,999,999.00') || ' ₺' || E'\n';
  report_text := report_text || '💵 صافي الربح: ' || TO_CHAR(net_profit, 'FM999,999,999.00') || ' ₺' || E'\n';
  report_text := report_text || '📋 عدد المعاملات: ' || transaction_count::TEXT;

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

  -- Send report to all authenticated admin chats
  FOR auth_sessions IN
    SELECT telegram_chat_id
    FROM accounting_telegram_auth
    WHERE is_active = true
      AND telegram_chat_id IS NOT NULL
      AND telegram_chat_id != ''
  LOOP
    BEGIN
      PERFORM net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'bot_token', bot_token,
          'chat_id', auth_sessions.telegram_chat_id,
          'message', report_text,
          'report_type', 'monthly',
          'month', report_month,
          'year', report_year
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error sending monthly report to %: %', auth_sessions.telegram_chat_id, SQLERRM;
    END;
  END LOOP;

  -- Also send to admin_chat_id if exists
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
          'message', report_text,
          'report_type', 'monthly',
          'month', report_month,
          'year', report_year
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error sending monthly report to admin chat: %', SQLERRM;
    END;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in send_accounting_monthly_report: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Verify the configuration
SELECT 
  id,
  bot_token,
  is_enabled,
  updated_at
FROM telegram_config
WHERE id = 3;

-- Step 6: Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name IN (
  'notify_accounting_telegram_transaction',
  'send_accounting_daily_report',
  'send_accounting_monthly_report'
)
ORDER BY routine_name;

