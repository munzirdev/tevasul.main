-- Verify and create accounting_budgets table if it doesn't exist
-- This migration ensures the table exists even if previous migration wasn't applied

-- Create budgets table if not exists
CREATE TABLE IF NOT EXISTS accounting_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES accounting_categories(id) ON DELETE SET NULL,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_tr VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    spent DECIMAL(15,2) DEFAULT 0,
    remaining DECIMAL(15,2) DEFAULT 0,
    percentage_used DECIMAL(5,2) DEFAULT 0,
    description_ar TEXT,
    description_en TEXT,
    description_tr TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (period_end >= period_start)
);

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_budgets_category ON accounting_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_type ON accounting_budgets(type);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON accounting_budgets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON accounting_budgets(is_active);

-- Enable RLS if not already enabled
ALTER TABLE accounting_budgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view budgets" ON accounting_budgets;
DROP POLICY IF EXISTS "Admins can manage budgets" ON accounting_budgets;

-- Create RLS policies for budgets
CREATE POLICY "Admins can view budgets" ON accounting_budgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage budgets" ON accounting_budgets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Refresh schema cache (if possible)
-- Note: This might not work in all Supabase instances
-- The schema cache should refresh automatically after table creation

