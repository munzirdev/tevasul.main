-- Get bot token from database
SELECT 
    id,
    bot_token,
    is_enabled,
    admin_chat_id
FROM telegram_config 
WHERE id = 2;
