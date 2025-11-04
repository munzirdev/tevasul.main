-- Create accounting_payments table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Create accounting_payments table
CREATE TABLE IF NOT EXISTS accounting_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES accounting_transactions(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'other')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes_ar TEXT,
    notes_en TEXT,
    notes_tr TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON accounting_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON accounting_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON accounting_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON accounting_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON accounting_payments(payment_method);

-- Enable Row Level Security
ALTER TABLE accounting_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view payments" ON accounting_payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON accounting_payments;

-- Create policies for RLS
CREATE POLICY "Admins can view payments" ON accounting_payments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage payments" ON accounting_payments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comment
COMMENT ON TABLE accounting_payments IS 'Stores payment records for invoices and transactions';

-- Verify table was created
SELECT 
    'Table created' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'accounting_payments';

