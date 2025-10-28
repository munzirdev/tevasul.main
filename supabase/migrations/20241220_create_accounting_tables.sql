-- Create accounting tables for daily cash flow management
-- Created: 2024-12-20

-- Create accounting_categories table for income and expense categories
CREATE TABLE IF NOT EXISTS accounting_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_tr VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description_ar TEXT,
    description_en TEXT,
    description_tr TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounting_transactions table for daily transactions
CREATE TABLE IF NOT EXISTS accounting_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES accounting_categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description_ar TEXT,
    description_en TEXT,
    description_tr TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_cash_summary table for daily summaries
CREATE TABLE IF NOT EXISTS daily_cash_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    summary_date DATE NOT NULL UNIQUE,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expense DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    notes_ar TEXT,
    notes_en TEXT,
    notes_tr TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_date ON accounting_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_type ON accounting_transactions(type);
CREATE INDEX IF NOT EXISTS idx_accounting_transactions_category ON accounting_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_daily_cash_summary_date ON daily_cash_summary(summary_date);

-- Create function to update daily summary
CREATE OR REPLACE FUNCTION update_daily_cash_summary(target_date DATE)
RETURNS VOID AS $$
DECLARE
    total_income DECIMAL(15,2) := 0;
    total_expense DECIMAL(15,2) := 0;
    previous_balance DECIMAL(15,2) := 0;
    calculated_closing_balance DECIMAL(15,2) := 0;
BEGIN
    -- Calculate totals for the target date
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM accounting_transactions
    WHERE transaction_date = target_date AND type = 'income';
    
    SELECT COALESCE(SUM(amount), 0) INTO total_expense
    FROM accounting_transactions
    WHERE transaction_date = target_date AND type = 'expense';
    
    -- Get previous day's closing balance
    SELECT COALESCE(dcs.closing_balance, 0) INTO previous_balance
    FROM daily_cash_summary dcs
    WHERE dcs.summary_date = target_date - INTERVAL '1 day'
    ORDER BY dcs.summary_date DESC
    LIMIT 1;
    
    -- Calculate closing balance
    calculated_closing_balance := previous_balance + total_income - total_expense;
    
    -- Insert or update daily summary
    INSERT INTO daily_cash_summary (
        summary_date,
        opening_balance,
        total_income,
        total_expense,
        closing_balance
    ) VALUES (
        target_date,
        previous_balance,
        total_income,
        total_expense,
        calculated_closing_balance
    )
    ON CONFLICT (summary_date) DO UPDATE SET
        opening_balance = EXCLUDED.opening_balance,
        total_income = EXCLUDED.total_income,
        total_expense = EXCLUDED.total_expense,
        closing_balance = EXCLUDED.closing_balance,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update daily summary when transactions are added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Update summary for the affected date(s)
    IF TG_OP = 'DELETE' THEN
        PERFORM update_daily_cash_summary(OLD.transaction_date);
    ELSE
        PERFORM update_daily_cash_summary(NEW.transaction_date);
    END IF;
    
    -- If transaction date changed, also update the old date
    IF TG_OP = 'UPDATE' AND OLD.transaction_date != NEW.transaction_date THEN
        PERFORM update_daily_cash_summary(OLD.transaction_date);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS accounting_transactions_summary_trigger ON accounting_transactions;
CREATE TRIGGER accounting_transactions_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounting_transactions
    FOR EACH ROW EXECUTE FUNCTION trigger_update_daily_summary();

-- Insert default categories
INSERT INTO accounting_categories (name_ar, name_en, name_tr, type, description_ar, description_en, description_tr) VALUES
-- Income categories
('معاملة زواج', 'Marriage Transaction', 'Evlilik İşlemi', 'income', 'رسوم معاملة الزواج', 'Marriage transaction fees', 'Evlilik işlemi ücretleri'),
('معاملة تصديق', 'Authentication Transaction', 'Doğrulama İşlemi', 'income', 'رسوم معاملة التصديق', 'Authentication transaction fees', 'Doğrulama işlemi ücretleri'),
('ترجمة', 'Translation', 'Çeviri', 'income', 'رسوم خدمات الترجمة', 'Translation service fees', 'Çeviri hizmet ücretleri'),
('أخرى', 'Other Income', 'Diğer Gelirler', 'income', 'مصادر الدخل الأخرى', 'Other sources of income', 'Diğer gelir kaynakları'),

-- Expense categories
('الرواتب', 'Salaries', 'Maaşlar', 'expense', 'رواتب الموظفين والأجور', 'Employee salaries and wages', 'Çalışan maaşları ve ücretleri'),
('الإيجار', 'Rent', 'Kira', 'expense', 'إيجار المكاتب والمباني', 'Office and building rent', 'Ofis ve bina kirası'),
('المرافق', 'Utilities', 'Kamu Hizmetleri', 'expense', 'الكهرباء والماء والغاز والإنترنت', 'Electricity, water, gas, and internet', 'Elektrik, su, gaz ve internet'),
('التسويق', 'Marketing', 'Pazarlama', 'expense', 'تكاليف التسويق والإعلان', 'Marketing and advertising costs', 'Pazarlama ve reklam maliyetleri'),
('الصيانة', 'Maintenance', 'Bakım', 'expense', 'صيانة المعدات والمباني', 'Equipment and building maintenance', 'Ekipman ve bina bakımı'),
('المواصلات', 'Transportation', 'Ulaşım', 'expense', 'تكاليف النقل والمواصلات', 'Transportation and travel costs', 'Nakliye ve seyahat maliyetleri'),
('اللوازم المكتبية', 'Office Supplies', 'Ofis Malzemeleri', 'expense', 'اللوازم والمعدات المكتبية', 'Office supplies and equipment', 'Ofis malzemeleri ve ekipmanları'),
('التأمين', 'Insurance', 'Sigorta', 'expense', 'أقساط التأمين', 'Insurance premiums', 'Sigorta primleri'),
('الضرائب', 'Taxes', 'Vergiler', 'expense', 'الضرائب والرسوم الحكومية', 'Taxes and government fees', 'Vergiler ve devlet harçları'),
('مصاريف المكتب', 'Office Expenses', 'Ofis Giderleri', 'expense', 'مصاريف المكتب العامة', 'General office expenses', 'Genel ofis giderleri'),
('فواتير', 'Bills', 'Faturalar', 'expense', 'فواتير الخدمات والمرافق', 'Service and utility bills', 'Hizmet ve kamu hizmetleri faturaları'),
('أخرى', 'Other Expenses', 'Diğer Giderler', 'expense', 'المصروفات الأخرى', 'Other miscellaneous expenses', 'Diğer çeşitli giderler');

-- Enable Row Level Security
ALTER TABLE accounting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cash_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins only
CREATE POLICY "Admins can view accounting data" ON accounting_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage accounting categories" ON accounting_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view transactions" ON accounting_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage transactions" ON accounting_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view daily summaries" ON daily_cash_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage daily summaries" ON daily_cash_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
