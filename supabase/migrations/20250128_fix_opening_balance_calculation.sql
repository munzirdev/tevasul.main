-- Fix opening balance calculation in daily cash summary
-- The issue: opening balance is calculated only from previous day's summary
-- If no previous summary exists, it should calculate from all transactions before the target date
-- Created: 2025-01-28

CREATE OR REPLACE FUNCTION update_daily_cash_summary(target_date DATE)
RETURNS VOID AS $$
DECLARE
    total_income DECIMAL(15,2) := 0;
    total_expense DECIMAL(15,2) := 0;
    previous_balance DECIMAL(15,2) := 0;
    calculated_closing_balance DECIMAL(15,2) := 0;
    previous_summary_date DATE;
    transactions_balance DECIMAL(15,2) := 0;
BEGIN
    -- Calculate totals for the target date
    SELECT COALESCE(SUM(amount), 0) INTO total_income
    FROM accounting_transactions
    WHERE transaction_date = target_date AND type = 'income';
    
    SELECT COALESCE(SUM(amount), 0) INTO total_expense
    FROM accounting_transactions
    WHERE transaction_date = target_date AND type = 'expense';
    
    -- Get previous day's closing balance from daily_cash_summary
    SELECT closing_balance, summary_date 
    INTO previous_balance, previous_summary_date
    FROM daily_cash_summary
    WHERE summary_date < target_date
    ORDER BY summary_date DESC
    LIMIT 1;
    
    -- If no previous summary exists, calculate balance from all transactions before target_date
    IF previous_balance IS NULL OR previous_summary_date IS NULL THEN
        -- Calculate balance from all transactions before target_date
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
        INTO previous_balance
        FROM accounting_transactions
        WHERE transaction_date < target_date;
        
        -- If still NULL, set to 0
        IF previous_balance IS NULL THEN
            previous_balance := 0;
        END IF;
    ELSE
        -- If we have a previous summary, but there might be transactions between 
        -- the previous summary date and target_date, we need to account for them
        -- Calculate balance from transactions between previous summary date and target_date
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
        INTO transactions_balance
        FROM accounting_transactions
        WHERE transaction_date > previous_summary_date AND transaction_date < target_date;
        
        -- Add transactions balance to previous balance
        IF transactions_balance IS NOT NULL THEN
            previous_balance := previous_balance + transactions_balance;
        END IF;
    END IF;
    
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

