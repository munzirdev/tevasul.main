-- تطبيق migrations يدوياً
-- يمكن تشغيله من Supabase Dashboard -> SQL Editor

-- 1. إضافة جدول telegram_conversation_sessions
CREATE TABLE IF NOT EXISTS telegram_conversation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_chat_id TEXT NOT NULL,
    telegram_username TEXT,
    conversation_type TEXT NOT NULL,
    current_step TEXT NOT NULL,
    collected_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 minutes'
);

CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat_id ON telegram_conversation_sessions(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_status ON telegram_conversation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_expires ON telegram_conversation_sessions(expires_at);

ALTER TABLE telegram_conversation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to telegram sessions" ON telegram_conversation_sessions;

CREATE POLICY "Allow all access to telegram sessions" ON telegram_conversation_sessions
    FOR ALL USING (true);

CREATE OR REPLACE FUNCTION update_telegram_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_telegram_sessions_updated_at ON telegram_conversation_sessions;

CREATE TRIGGER update_telegram_sessions_updated_at
    BEFORE UPDATE ON telegram_conversation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_sessions_updated_at();

-- 2. إضافة عمود telegram_chat_id إلى voluntary_return_forms إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'voluntary_return_forms' 
        AND column_name = 'telegram_chat_id'
    ) THEN
        ALTER TABLE voluntary_return_forms 
        ADD COLUMN telegram_chat_id TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_voluntary_return_forms_telegram_chat 
        ON voluntary_return_forms(telegram_chat_id);
    END IF;
END $$;

-- 3. تطبيق migration للمستخدمين المصرح لهم (إذا لم يتم تطبيقها)
CREATE TABLE IF NOT EXISTS telegram_allowed_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT,
    country_code TEXT DEFAULT '+90',
    full_name TEXT,
    telegram_chat_id TEXT,
    telegram_username TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_phone ON telegram_allowed_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_chat_id ON telegram_allowed_users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_username ON telegram_allowed_users(telegram_username);
CREATE INDEX IF NOT EXISTS idx_telegram_allowed_users_active ON telegram_allowed_users(is_active);

ALTER TABLE telegram_allowed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and moderators can manage telegram allowed users" ON telegram_allowed_users;

CREATE POLICY "Admins and moderators can manage telegram allowed users" ON telegram_allowed_users
    FOR ALL USING (true);

CREATE OR REPLACE FUNCTION update_telegram_allowed_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_telegram_allowed_users_updated_at ON telegram_allowed_users;

CREATE TRIGGER update_telegram_allowed_users_updated_at
    BEFORE UPDATE ON telegram_allowed_users
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_allowed_users_updated_at();

SELECT 'تم تطبيق جميع migrations بنجاح!' as message;

