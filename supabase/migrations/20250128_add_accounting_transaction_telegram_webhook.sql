-- Create trigger to send telegram notification when accounting transaction is added/updated
-- Created: 2025-01-28

-- Function to send telegram notification for accounting transactions
CREATE OR REPLACE FUNCTION notify_telegram_on_accounting_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_bot_token TEXT;
  v_config RECORD;
  v_allowed_users TEXT[];
  v_chat_id TEXT;
  v_message TEXT;
  v_transaction_type TEXT;
  v_category_name TEXT;
  v_daily_summary RECORD;
  v_daily_income DECIMAL(15,2) := 0;
  v_daily_expense DECIMAL(15,2) := 0;
  v_monthly_income DECIMAL(15,2) := 0;
  v_monthly_expense DECIMAL(15,2) := 0;
  v_current_balance DECIMAL(15,2) := 0;
  v_response JSONB;
BEGIN
  -- Get telegram config
  SELECT bot_token, admin_chat_id INTO v_config
  FROM telegram_config
  WHERE id = 2 AND is_enabled = true
  LIMIT 1;

  IF v_config.bot_token IS NULL OR v_config.bot_token = '' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get category name
  SELECT COALESCE(name_ar, name_en, name_tr) INTO v_category_name
  FROM accounting_categories
  WHERE id = COALESCE(NEW.category_id, OLD.category_id)
  LIMIT 1;

  IF v_category_name IS NULL THEN
    v_category_name := 'غير محدد';
  END IF;

  -- Get transaction type in Arabic
  IF TG_OP = 'DELETE' THEN
    v_transaction_type := CASE WHEN OLD.type = 'income' THEN 'وارد' ELSE 'صادر' END;
  ELSE
    v_transaction_type := CASE WHEN NEW.type = 'income' THEN 'وارد' ELSE 'صادر' END;
  END IF;

  -- Calculate daily totals directly from transactions (more accurate)
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_daily_income, v_daily_expense
  FROM accounting_transactions
  WHERE transaction_date = COALESCE(NEW.transaction_date, OLD.transaction_date);

  -- Calculate current balance from all transactions up to and including today
  -- This ensures we get the correct balance even if daily_cash_summary hasn't been updated yet
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_current_balance
  FROM accounting_transactions
  WHERE transaction_date <= COALESCE(NEW.transaction_date, OLD.transaction_date);
  
  -- If balance is NULL (no transactions), set to 0
  IF v_current_balance IS NULL THEN
    v_current_balance := 0;
  END IF;

  -- Calculate monthly totals
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_monthly_income, v_monthly_expense
  FROM accounting_transactions
  WHERE DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', COALESCE(NEW.transaction_date, OLD.transaction_date));

  -- Build message based on operation type
  IF TG_OP = 'DELETE' THEN
    v_message := format(
      '🗑️ <b>تم حذف معاملة</b>%s' ||
      '📋 <b>تفاصيل المعاملة:</b>%s' ||
      '• النوع: %s%s' ||
      '• المبلغ: <b>%s ₺</b>%s' ||
      '• الفئة: %s%s' ||
      '• التاريخ: %s%s' ||
      '%s' ||
      '💵 <b>تفاصيل الصندوق:</b>%s' ||
      '• الرصيد الحالي: <b>%s ₺</b>%s' ||
      '• الواردات اليوم: %s ₺%s' ||
      '• الصادرات اليوم: %s ₺%s' ||
      '• صافي اليوم: <b>%s ₺</b>%s' ||
      '%s' ||
      '📊 <b>إجماليات الشهر:</b>%s' ||
      '• الواردات الشهرية: %s ₺%s' ||
      '• الصادرات الشهرية: %s ₺%s' ||
      '• صافي الشهر: <b>%s ₺</b>%s' ||
      '%s' ||
      '🕐 %s',
      E'\n\n',
      E'\n',
      v_transaction_type, E'\n',
      OLD.amount::TEXT, E'\n',
      v_category_name, E'\n',
      TO_CHAR(OLD.transaction_date, 'DD/MM/YYYY'), E'\n\n',
      E'\n',
      E'\n',
      v_current_balance::TEXT, E'\n',
      v_daily_income::TEXT, E'\n',
      v_daily_expense::TEXT, E'\n',
      (v_daily_income - v_daily_expense)::TEXT, E'\n\n',
      E'\n',
      E'\n',
      v_monthly_income::TEXT, E'\n',
      v_monthly_expense::TEXT, E'\n',
      (v_monthly_income - v_monthly_expense)::TEXT, E'\n\n',
      E'\n',
      TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_message := format(
      '✏️ <b>تم تحديث معاملة</b>%s' ||
      '📋 <b>تفاصيل المعاملة:</b>%s' ||
      '• النوع: %s%s' ||
      '• المبلغ: <b>%s ₺</b>%s' ||
      '• الفئة: %s%s' ||
      '• التاريخ: %s%s' ||
      '%s' ||
      '💵 <b>تفاصيل الصندوق:</b>%s' ||
      '• الرصيد الحالي: <b>%s ₺</b>%s' ||
      '• الواردات اليوم: %s ₺%s' ||
      '• الصادرات اليوم: %s ₺%s' ||
      '• صافي اليوم: <b>%s ₺</b>%s' ||
      '%s' ||
      '📊 <b>إجماليات الشهر:</b>%s' ||
      '• الواردات الشهرية: %s ₺%s' ||
      '• الصادرات الشهرية: %s ₺%s' ||
      '• صافي الشهر: <b>%s ₺</b>%s' ||
      '%s' ||
      '🕐 %s',
      E'\n\n',
      E'\n',
      v_transaction_type, E'\n',
      NEW.amount::TEXT, E'\n',
      v_category_name, E'\n',
      TO_CHAR(NEW.transaction_date, 'DD/MM/YYYY'), E'\n\n',
      E'\n',
      E'\n',
      v_current_balance::TEXT, E'\n',
      v_daily_income::TEXT, E'\n',
      v_daily_expense::TEXT, E'\n',
      (v_daily_income - v_daily_expense)::TEXT, E'\n\n',
      E'\n',
      E'\n',
      v_monthly_income::TEXT, E'\n',
      v_monthly_expense::TEXT, E'\n',
      (v_monthly_income - v_monthly_expense)::TEXT, E'\n\n',
      E'\n',
      TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI')
    );
  ELSE -- INSERT
    v_message := format(
      '%s <b>%s جديد في الصندوق</b>%s' ||
      '📋 <b>تفاصيل المعاملة:</b>%s' ||
      '• النوع: %s%s' ||
      '• المبلغ: <b>%s ₺</b>%s' ||
      '• الفئة: %s%s' ||
      '• التاريخ: %s%s' ||
      '%s' ||
      '💵 <b>تفاصيل الصندوق:</b>%s' ||
      '• الرصيد الحالي: <b>%s ₺</b>%s' ||
      '• الواردات اليوم: %s ₺%s' ||
      '• الصادرات اليوم: %s ₺%s' ||
      '• صافي اليوم: <b>%s ₺</b>%s' ||
      '%s' ||
      '📊 <b>إجماليات الشهر:</b>%s' ||
      '• الواردات الشهرية: %s ₺%s' ||
      '• الصادرات الشهرية: %s ₺%s' ||
      '• صافي الشهر: <b>%s ₺</b>%s' ||
      '%s' ||
      '🕐 %s',
      CASE WHEN NEW.type = 'income' THEN '💰' ELSE '💸' END,
      CASE WHEN NEW.type = 'income' THEN 'وارد' ELSE 'صادر' END,
      E'\n\n',
      E'\n',
      v_transaction_type, E'\n',
      NEW.amount::TEXT, E'\n',
      v_category_name, E'\n',
      TO_CHAR(NEW.transaction_date, 'DD/MM/YYYY'), E'\n\n',
      E'\n',
      E'\n',
      v_current_balance::TEXT, E'\n',
      v_daily_income::TEXT, E'\n',
      v_daily_expense::TEXT, E'\n',
      (v_daily_income - v_daily_expense)::TEXT, E'\n\n',
      E'\n',
      E'\n',
      v_monthly_income::TEXT, E'\n',
      v_monthly_expense::TEXT, E'\n',
      (v_monthly_income - v_monthly_expense)::TEXT, E'\n\n',
      E'\n',
      TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI')
    );
  END IF;

  -- Get list of chat IDs to send to
  v_allowed_users := ARRAY[]::TEXT[];
  
  -- Add admin chat ID if exists
  IF v_config.admin_chat_id IS NOT NULL AND v_config.admin_chat_id != '' THEN
    v_allowed_users := array_append(v_allowed_users, v_config.admin_chat_id);
  END IF;

  -- Add allowed users chat IDs
  SELECT array_agg(telegram_chat_id) INTO v_allowed_users
  FROM (
    SELECT telegram_chat_id 
    FROM telegram_allowed_users
    WHERE is_active = true 
      AND telegram_chat_id IS NOT NULL
      AND telegram_chat_id != ''
    UNION
    SELECT unnest(v_allowed_users)
  ) AS all_chats;

  -- Send message to all chat IDs
  IF v_allowed_users IS NOT NULL AND array_length(v_allowed_users, 1) > 0 THEN
    FOREACH v_chat_id IN ARRAY v_allowed_users
    LOOP
      BEGIN
        -- Send notification via HTTP to Telegram API
        SELECT content::jsonb INTO v_response
        FROM http((
          'POST',
          'https://api.telegram.org/bot' || v_config.bot_token || '/sendMessage',
          ARRAY[
            http_header('Content-Type', 'application/json')
          ],
          'application/json',
          json_build_object(
            'chat_id', v_chat_id,
            'text', v_message,
            'parse_mode', 'HTML'
          )::text
        )::http_request);
      EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Failed to send telegram notification to %: %', v_chat_id, SQLERRM;
      END;
    END LOOP;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_telegram_accounting_transaction ON accounting_transactions;

CREATE TRIGGER trigger_notify_telegram_accounting_transaction
  AFTER INSERT OR UPDATE OR DELETE ON accounting_transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram_on_accounting_transaction();

-- Note: This trigger uses http() function which requires http extension
-- If http extension is not available, use pg_net extension instead:
-- CREATE EXTENSION IF NOT EXISTS pg_net;
-- Then use net.http_post() instead of http()

