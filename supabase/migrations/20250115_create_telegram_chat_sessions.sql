-- Create table for telegram chat sessions between admin and customers
CREATE TABLE IF NOT EXISTS telegram_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE, -- refers to chat_messages.session_id
    admin_telegram_chat_id TEXT NOT NULL,
    customer_session_id TEXT, -- the web session id
    customer_name TEXT,
    customer_email TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_chat_sessions_session_id ON telegram_chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chat_sessions_admin_chat_id ON telegram_chat_sessions(admin_telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chat_sessions_status ON telegram_chat_sessions(status);

-- Enable RLS
ALTER TABLE telegram_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all access to telegram chat sessions" ON telegram_chat_sessions
    FOR ALL USING (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_telegram_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_telegram_chat_sessions_updated_at
    BEFORE UPDATE ON telegram_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_chat_sessions_updated_at();
