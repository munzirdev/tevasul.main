-- Create dynamic_forms table
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

-- Enable Row Level Security
ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for dynamic_forms
CREATE POLICY "Enable read access for authenticated users" ON dynamic_forms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON dynamic_forms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON dynamic_forms
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON dynamic_forms
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dynamic_forms_created_at ON dynamic_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dynamic_forms_is_active ON dynamic_forms(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dynamic_forms_updated_at
  BEFORE UPDATE ON dynamic_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
