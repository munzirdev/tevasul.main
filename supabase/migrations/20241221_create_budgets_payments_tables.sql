-- Create budgets and payments tables for accounting system
-- Created: 2024-12-21

-- Create budgets table
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

-- Create payments table
CREATE TABLE IF NOT EXISTS accounting_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES accounting_transactions(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'other')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number VARCHAR(255),
    notes_ar TEXT,
    notes_en TEXT,
    notes_tr TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounting_settings table
CREATE TABLE IF NOT EXISTS accounting_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    currency VARCHAR(10) DEFAULT 'TRY',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    fiscal_year_start VARCHAR(10) DEFAULT '01-01',
    auto_backup BOOLEAN DEFAULT true,
    notifications BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id)
);

-- Insert default settings
INSERT INTO accounting_settings (id, currency, date_format, fiscal_year_start, auto_backup, notifications)
VALUES ('00000000-0000-0000-0000-000000000001', 'TRY', 'DD/MM/YYYY', '01-01', true, true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_category ON accounting_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_type ON accounting_budgets(type);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON accounting_budgets(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON accounting_budgets(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON accounting_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON accounting_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON accounting_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON accounting_payments(status);

-- Create function to update budget calculations
CREATE OR REPLACE FUNCTION update_budget_calculations()
RETURNS TRIGGER AS $$
DECLARE
    budget_record accounting_budgets%ROWTYPE;
    total_spent DECIMAL(15,2);
BEGIN
    -- Update all budgets that might be affected
    FOR budget_record IN 
        SELECT * FROM accounting_budgets WHERE is_active = true
    LOOP
        -- Calculate spent amount for expense budgets
        IF budget_record.type = 'expense' THEN
            SELECT COALESCE(SUM(amount), 0) INTO total_spent
            FROM accounting_transactions
            WHERE transaction_date >= budget_record.period_start 
            AND transaction_date <= budget_record.period_end
            AND type = 'expense'
            AND (budget_record.category_id IS NULL OR category_id = budget_record.category_id);
        ELSE
            -- Calculate spent amount for income budgets (actual income)
            SELECT COALESCE(SUM(amount), 0) INTO total_spent
            FROM accounting_transactions
            WHERE transaction_date >= budget_record.period_start 
            AND transaction_date <= budget_record.period_end
            AND type = 'income'
            AND (budget_record.category_id IS NULL OR category_id = budget_record.category_id);
        END IF;
        
        -- Update budget calculations
        UPDATE accounting_budgets
        SET 
            spent = total_spent,
            remaining = amount - total_spent,
            percentage_used = CASE 
                WHEN amount > 0 THEN (total_spent / amount) * 100 
                ELSE 0 
            END,
            updated_at = NOW()
        WHERE id = budget_record.id;
    END LOOP;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update budgets when transactions change
DROP TRIGGER IF EXISTS trigger_update_budgets ON accounting_transactions;
CREATE TRIGGER trigger_update_budgets
    AFTER INSERT OR UPDATE OR DELETE ON accounting_transactions
    FOR EACH ROW EXECUTE FUNCTION update_budget_calculations();

-- Enable Row Level Security
ALTER TABLE accounting_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_settings ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for payments
CREATE POLICY "Admins can view payments" ON accounting_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage payments" ON accounting_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create RLS policies for settings
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

