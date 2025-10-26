-- Create trigger to send telegram notification when customer sends a message in active chat session

-- Function to send telegram notification for new customer messages
CREATE OR REPLACE FUNCTION notify_telegram_on_new_customer_message()
RETURNS TRIGGER AS $$
DECLARE
  v_bot_token TEXT;
  v_chat_session RECORD;
  v_message TEXT;
  v_send_result JSONB;
BEGIN
  -- Only process messages from customers (sender = 'user')
  IF NEW.sender != 'user' THEN
    RETURN NEW;
  END IF;

  -- Check if there's an active telegram chat session for this message
  SELECT * INTO v_chat_session
  FROM telegram_chat_sessions
  WHERE session_id = NEW.session_id
    AND status = 'active'
  LIMIT 1;

  -- If no active session, return
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Get bot token
  SELECT bot_token INTO v_bot_token
  FROM telegram_config
  WHERE id = 2 AND is_enabled = true
  LIMIT 1;

  IF v_bot_token IS NULL THEN
    RETURN NEW;
  END IF;

  -- Prepare notification message
  v_message := format(
    '💬 <b>رسالة جديدة من العميل</b>%s%s<b>📍 الجلسة:</b> <code>%s</code>',
    E'\n\n',
    '<b>💬 الرسالة:</b>' || E'\n' || NEW.content || E'\n\n',
    substring(NEW.session_id from 1 for 8)
  );

  -- Send notification to admin via Telegram
  SELECT content::jsonb INTO v_send_result
  FROM http((
    'POST',
    'https://api.telegram.org/bot' || v_bot_token || '/sendMessage',
    ARRAY[
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    json_build_object(
      'chat_id', v_chat_session.admin_telegram_chat_id,
      'text', v_message,
      'parse_mode', 'HTML'
    )::text
  )::http_request);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_telegram_new_customer_message ON chat_messages;

CREATE TRIGGER trigger_notify_telegram_new_customer_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  WHEN (NEW.sender = 'user')
  EXECUTE FUNCTION notify_telegram_on_new_customer_message();

-- Comment
COMMENT ON FUNCTION notify_telegram_on_new_customer_message() IS 'Sends telegram notification to admin when customer sends a new message in an active chat session';
