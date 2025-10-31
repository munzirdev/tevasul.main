-- Create accounting_settings table
-- Created: 2024-12-21

-- Create accounting_settings table
CREATE TABLE IF NOT EXISTS accounting_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    currency VARCHAR(10) DEFAULT 'TRY',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    fiscal_year_start VARCHAR(10) DEFAULT '01-01',
    default_tax_rate DECIMAL(5,2) DEFAULT 20.00,
    auto_backup BOOLEAN DEFAULT true,
    notifications BOOLEAN DEFAULT true,
    invoice_prefix VARCHAR(20) DEFAULT 'INV',
    invoice_number_format VARCHAR(50) DEFAULT 'YYYYMMDD-###',
    company_name_ar VARCHAR(255) DEFAULT 'مجموعة تواصل',
    company_name_en VARCHAR(255) DEFAULT 'Tevasul Group',
    company_address TEXT,
    company_phone VARCHAR(50) DEFAULT '+90 534 962 72 41',
    company_email VARCHAR(255) DEFAULT 'info@tevasul.group',
    company_website VARCHAR(255) DEFAULT 'tevasul.group',
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id)
);

-- Insert default settings
INSERT INTO accounting_settings (id, currency, date_format, fiscal_year_start, default_tax_rate, auto_backup, notifications, invoice_prefix, invoice_number_format, company_name_ar, company_name_en, company_address, company_phone, company_email, company_website)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'TRY', 
    'DD/MM/YYYY', 
    '01-01', 
    20.00,
    true, 
    true,
    'INV',
    'YYYYMMDD-###',
    'مجموعة تواصل',
    'Tevasul Group',
    'CamiŞerif Mah. 5210 Sk. No:11A Akdeniz / Mersin',
    '+90 534 962 72 41',
    'info@tevasul.group',
    'tevasul.group'
)
ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW();

-- Enable Row Level Security
ALTER TABLE accounting_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for settings
DROP POLICY IF EXISTS "Admins can view settings" ON accounting_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON accounting_settings;

CREATE POLICY "Admins can view settings" ON accounting_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage settings" ON accounting_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

