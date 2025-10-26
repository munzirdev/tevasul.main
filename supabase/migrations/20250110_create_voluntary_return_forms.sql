-- Create voluntary_return_forms table
CREATE TABLE IF NOT EXISTS voluntary_return_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_chat_id TEXT,
    full_name_tr TEXT NOT NULL,
    full_name_ar TEXT NOT NULL,
    kimlik_no TEXT NOT NULL,
    sinir_kapisi TEXT NOT NULL,
    gsm TEXT,
    custom_date DATE,
    refakat_entries JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voluntary_return_forms_user_id ON voluntary_return_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_voluntary_return_forms_created_at ON voluntary_return_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voluntary_return_forms_telegram_chat_id ON voluntary_return_forms(telegram_chat_id);

-- Enable Row Level Security
ALTER TABLE voluntary_return_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for voluntary_return_forms
DO $$
BEGIN
    -- Policy for users to read their own forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Users can read their own forms'
    ) THEN
        CREATE POLICY "Users can read their own forms" ON voluntary_return_forms
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Policy for admins and moderators to read all forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Admins and moderators can read all forms'
    ) THEN
        CREATE POLICY "Admins and moderators can read all forms" ON voluntary_return_forms
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'moderator')
                )
            );
    END IF;

    -- Policy for users to insert their own forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Users can insert their own forms'
    ) THEN
        CREATE POLICY "Users can insert their own forms" ON voluntary_return_forms
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Policy for admins and moderators to insert forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Admins and moderators can insert forms'
    ) THEN
        CREATE POLICY "Admins and moderators can insert forms" ON voluntary_return_forms
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'moderator')
                )
            );
    END IF;

    -- Policy for users to update their own forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Users can update their own forms'
    ) THEN
        CREATE POLICY "Users can update their own forms" ON voluntary_return_forms
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Policy for admins and moderators to update all forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Admins and moderators can update all forms'
    ) THEN
        CREATE POLICY "Admins and moderators can update all forms" ON voluntary_return_forms
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'moderator')
                )
            );
    END IF;

    -- Policy for users to delete their own forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Users can delete their own forms'
    ) THEN
        CREATE POLICY "Users can delete their own forms" ON voluntary_return_forms
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Policy for admins and moderators to delete all forms
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'voluntary_return_forms' 
        AND policyname = 'Admins and moderators can delete all forms'
    ) THEN
        CREATE POLICY "Admins and moderators can delete all forms" ON voluntary_return_forms
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'moderator')
                )
            );
    END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_voluntary_return_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_voluntary_return_forms_updated_at
    BEFORE UPDATE ON voluntary_return_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_voluntary_return_forms_updated_at();
