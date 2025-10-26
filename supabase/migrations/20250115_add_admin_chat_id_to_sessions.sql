-- Add admin_telegram_chat_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'telegram_chat_sessions' 
        AND column_name = 'admin_telegram_chat_id'
    ) THEN
        -- Create the table if it doesn't exist with all columns
        CREATE TABLE IF NOT EXISTS telegram_chat_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            session_id TEXT NOT NULL UNIQUE,
            admin_telegram_chat_id TEXT NOT NULL,
            customer_session_id TEXT,
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
        DROP POLICY IF EXISTS "Allow all access to telegram chat sessions" ON telegram_chat_sessions;
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
        DROP TRIGGER IF EXISTS update_telegram_chat_sessions_updated_at ON telegram_chat_sessions;
        CREATE TRIGGER update_telegram_chat_sessions_updated_at
            BEFORE UPDATE ON telegram_chat_sessions
            FOR EACH ROW
            EXECUTE FUNCTION update_telegram_chat_sessions_updated_at();
    ELSE
        -- Table exists but column might not exist, add it
        ALTER TABLE telegram_chat_sessions 
        ADD COLUMN IF NOT EXISTS admin_telegram_chat_id TEXT;
        
        -- Make it NOT NULL after adding
        ALTER TABLE telegram_chat_sessions 
        ALTER COLUMN admin_telegram_chat_id SET NOT NULL;
        
        -- Add index if not exists
        CREATE INDEX IF NOT EXISTS idx_telegram_chat_sessions_admin_chat_id 
        ON telegram_chat_sessions(admin_telegram_chat_id);
    END IF;
END $$;
