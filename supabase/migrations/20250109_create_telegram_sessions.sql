-- Create table for telegram conversation sessions
CREATE TABLE IF NOT EXISTS telegram_conversation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_chat_id TEXT NOT NULL,
    telegram_username TEXT,
    conversation_type TEXT NOT NULL, -- 'voluntary_return', 'health_insurance', etc.
    current_step TEXT NOT NULL, -- 'awaiting_name', 'awaiting_kimlik', etc.
    collected_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat_id ON telegram_conversation_sessions(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_status ON telegram_conversation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_expires ON telegram_conversation_sessions(expires_at);

-- Enable RLS
ALTER TABLE telegram_conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all access to telegram sessions" ON telegram_conversation_sessions
    FOR ALL USING (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_telegram_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_telegram_sessions_updated_at
    BEFORE UPDATE ON telegram_conversation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_sessions_updated_at();

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_telegram_sessions()
RETURNS void AS $$
BEGIN
    UPDATE telegram_conversation_sessions
    SET status = 'cancelled'
    WHERE status = 'active' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

