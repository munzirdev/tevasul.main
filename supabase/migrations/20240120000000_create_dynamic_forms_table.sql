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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dynamic_forms_created_at ON dynamic_forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dynamic_forms_is_active ON dynamic_forms(is_active);

-- Enable Row Level Security
ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for dynamic_forms
-- Allow admins to do everything
CREATE POLICY "Admins can do everything on dynamic_forms" ON dynamic_forms
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Allow moderators to read and update
CREATE POLICY "Moderators can read and update dynamic_forms" ON dynamic_forms
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

CREATE POLICY "Moderators can update dynamic_forms" ON dynamic_forms
  FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'moderator'));

-- Allow authenticated users to read active forms
CREATE POLICY "Authenticated users can read active dynamic_forms" ON dynamic_forms
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dynamic_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_dynamic_forms_updated_at
  BEFORE UPDATE ON dynamic_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_dynamic_forms_updated_at();
