-- Create RPC function to create dynamic_forms table
CREATE OR REPLACE FUNCTION create_dynamic_forms_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create dynamic_forms table if it doesn't exist
  CREATE TABLE IF NOT EXISTS dynamic_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable Row Level Security if not already enabled
  ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
  DO $$
  BEGIN
    -- Read policy
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'dynamic_forms' 
      AND policyname = 'Enable read access for authenticated users'
    ) THEN
      CREATE POLICY "Enable read access for authenticated users" ON dynamic_forms
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Insert policy
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'dynamic_forms' 
      AND policyname = 'Enable insert access for authenticated users'
    ) THEN
      CREATE POLICY "Enable insert access for authenticated users" ON dynamic_forms
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Update policy
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'dynamic_forms' 
      AND policyname = 'Enable update access for authenticated users'
    ) THEN
      CREATE POLICY "Enable update access for authenticated users" ON dynamic_forms
        FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    -- Delete policy
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'dynamic_forms' 
      AND policyname = 'Enable delete access for authenticated users'
    ) THEN
      CREATE POLICY "Enable delete access for authenticated users" ON dynamic_forms
        FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
  END $$;

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_dynamic_forms_created_at ON dynamic_forms(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_dynamic_forms_is_active ON dynamic_forms(is_active);

  -- Create function to update updated_at timestamp if it doesn't exist
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Create trigger if it doesn't exist
  DROP TRIGGER IF EXISTS update_dynamic_forms_updated_at ON dynamic_forms;
  CREATE TRIGGER update_dynamic_forms_updated_at
    BEFORE UPDATE ON dynamic_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

END;
$$;
