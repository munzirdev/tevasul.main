-- Create telegram_allowed_users table
CREATE TABLE IF NOT EXISTS telegram_allowed_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL UNIQUE,
    country_code TEXT DEFAULT '+90',
    full_name TEXT,
    telegram_chat_id TEXT,
    telegram_username TEXT,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_phone ON telegram_allowed_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_chat_id ON telegram_allowed_users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_active ON telegram_allowed_users(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE telegram_allowed_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admins and moderators to manage allowed users
CREATE POLICY "Admins and moderators can manage telegram allowed users" ON telegram_allowed_users
    FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_allowed_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_telegram_allowed_users_updated_at
    BEFORE UPDATE ON telegram_allowed_users
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_allowed_users_updated_at();

