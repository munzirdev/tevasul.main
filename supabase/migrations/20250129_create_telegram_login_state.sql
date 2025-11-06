-- Create telegram_login_state table for tracking login flow state
-- This table stores temporary login state for users during the login process

CREATE TABLE IF NOT EXISTS telegram_login_state (
  telegram_chat_id TEXT PRIMARY KEY,
  login_state TEXT NOT NULL CHECK (login_state IN ('waiting_email', 'waiting_password')),
  temp_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_login_state_created_at ON telegram_login_state(created_at);

-- Create function to clean up expired login states
CREATE OR REPLACE FUNCTION cleanup_expired_login_states()
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_login_state 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies (if needed, allow all for now)
ALTER TABLE telegram_login_state ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all
DROP POLICY IF EXISTS "Service role can access all" ON telegram_login_state;
CREATE POLICY "Service role can access all" ON telegram_login_state
  FOR ALL
  USING (true);

-- Add comment
COMMENT ON TABLE telegram_login_state IS 'Stores temporary login state for Telegram bot users during login flow';
COMMENT ON COLUMN telegram_login_state.login_state IS 'Current login state: waiting_email or waiting_password';
COMMENT ON COLUMN telegram_login_state.temp_email IS 'Temporarily stored email during login flow';
COMMENT ON COLUMN telegram_login_state.expires_at IS 'Login state expires after 10 minutes for security';

