-- Create telegram_notifications table
CREATE TABLE IF NOT EXISTS telegram_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    language TEXT DEFAULT 'ar',
    request_type TEXT NOT NULL,
    user_info JSONB,
    additional_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    admin_response TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_session_id ON telegram_notifications(session_id);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_status ON telegram_notifications(status);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_priority ON telegram_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_created_at ON telegram_notifications(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE telegram_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admins and moderators to access all notifications
CREATE POLICY "Admins and moderators can access all notifications" ON telegram_notifications
    FOR ALL USING (true); -- Allow all for now, can be restricted later

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_telegram_notifications_updated_at
    BEFORE UPDATE ON telegram_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_notifications_updated_at();

