-- Create accounting telegram bot configuration
-- Insert accounting bot config (id=3) - جميع إشعارات المحاسبة تستخدم هذا البوت
INSERT INTO telegram_config (id, bot_token, admin_chat_id, is_enabled) 
VALUES (3, '8588395762:AAFa91LU4O6HRevUM5tyatANCvY6HYQuLh0', '', true)
ON CONFLICT (id) DO UPDATE 
SET bot_token = EXCLUDED.bot_token,
    is_enabled = true,
    updated_at = NOW();

-- Create table to store authenticated admin sessions in telegram
CREATE TABLE IF NOT EXISTS accounting_telegram_auth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_chat_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    authenticated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE accounting_telegram_auth ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage accounting telegram auth" ON accounting_telegram_auth;
DROP POLICY IF EXISTS "Service role can manage accounting telegram auth" ON accounting_telegram_auth;

-- Create policy for admins to access auth sessions
CREATE POLICY "Admins can manage accounting telegram auth" ON accounting_telegram_auth
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policy for service role
CREATE POLICY "Service role can manage accounting telegram auth" ON accounting_telegram_auth
    FOR ALL USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS accounting_telegram_auth_chat_id_idx ON accounting_telegram_auth(telegram_chat_id);
CREATE INDEX IF NOT EXISTS accounting_telegram_auth_user_id_idx ON accounting_telegram_auth(user_id);
CREATE INDEX IF NOT EXISTS accounting_telegram_auth_is_active_idx ON accounting_telegram_auth(is_active);

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_accounting_telegram_sessions()
RETURNS void AS $$
BEGIN
    UPDATE accounting_telegram_auth
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

