-- Create telegram_config table
CREATE TABLE IF NOT EXISTS telegram_config (
    id INTEGER PRIMARY KEY DEFAULT 2,
    bot_token TEXT,
    admin_chat_id TEXT,
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE telegram_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to access and modify config
CREATE POLICY "Admins can manage telegram config" ON telegram_config
    FOR ALL USING (true); -- Allow all for now, can be restricted later

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_telegram_config_updated_at
    BEFORE UPDATE ON telegram_config
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_config_updated_at();

-- Insert default config
INSERT INTO telegram_config (id, bot_token, admin_chat_id, is_enabled) 
VALUES (2, '', '', false)
ON CONFLICT (id) DO NOTHING;
