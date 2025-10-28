-- Create Invoice System Tables
-- This script creates all necessary tables for the invoice management system

-- 1. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_address TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes_ar TEXT,
    notes_en TEXT,
    notes_tr TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description_ar VARCHAR(500) NOT NULL,
    description_en VARCHAR(500),
    description_tr VARCHAR(500),
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create invoice_templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_tr VARCHAR(255),
    template_content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- 5. Create function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals(invoice_uuid UUID)
RETURNS VOID AS $$
DECLARE
    invoice_subtotal DECIMAL(15,2) := 0;
    invoice_tax_rate DECIMAL(5,2) := 0;
    invoice_tax_amount DECIMAL(15,2) := 0;
    invoice_total DECIMAL(15,2) := 0;
BEGIN
    -- Calculate subtotal from invoice items
    SELECT COALESCE(SUM(total_price), 0) INTO invoice_subtotal
    FROM invoice_items
    WHERE invoice_id = invoice_uuid;
    
    -- Get tax rate from invoice
    SELECT tax_rate INTO invoice_tax_rate
    FROM invoices
    WHERE id = invoice_uuid;
    
    -- Calculate tax amount
    invoice_tax_amount := invoice_subtotal * (invoice_tax_rate / 100);
    
    -- Calculate total amount
    invoice_total := invoice_subtotal + invoice_tax_amount;
    
    -- Update invoice with calculated totals
    UPDATE invoices
    SET 
        subtotal = invoice_subtotal,
        tax_amount = invoice_tax_amount,
        total_amount = invoice_total,
        updated_at = NOW()
    WHERE id = invoice_uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update invoice totals when items change
CREATE OR REPLACE FUNCTION trigger_update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update totals for the affected invoice
    IF TG_OP = 'DELETE' THEN
        PERFORM update_invoice_totals(OLD.invoice_id);
        RETURN OLD;
    ELSE
        PERFORM update_invoice_totals(NEW.invoice_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_invoice_totals ON invoice_items;

-- Create trigger
CREATE TRIGGER trigger_update_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_invoice_totals();

-- 7. Create function to generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    generated_number VARCHAR(50);
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Generate invoice number with current date and counter
        generated_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoices.invoice_number = generated_number) THEN
            RETURN generated_number;
        END IF;
        
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > 999 THEN
            RAISE EXCEPTION 'Unable to generate unique invoice number';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 8. Create RLS policies for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Admins can manage invoice templates" ON invoice_templates;

-- Create policies for invoices
CREATE POLICY "Admins can manage invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create policies for invoice_items
CREATE POLICY "Admins can manage invoice items" ON invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create policies for invoice_templates
CREATE POLICY "Admins can manage invoice templates" ON invoice_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- 9. Insert default invoice template
INSERT INTO invoice_templates (name_ar, name_en, name_tr, template_content, is_default)
VALUES (
    'قالب الفاتورة الافتراضي',
    'Default Invoice Template',
    'Varsayılan Fatura Şablonu',
    '<div class="invoice-template">
        <h1>فاتورة</h1>
        <p>رقم الفاتورة: {{invoice_number}}</p>
        <p>تاريخ الإصدار: {{issue_date}}</p>
        <p>تاريخ الاستحقاق: {{due_date}}</p>
        <h2>معلومات العميل</h2>
        <p>الاسم: {{client_name}}</p>
        <p>البريد الإلكتروني: {{client_email}}</p>
        <p>الهاتف: {{client_phone}}</p>
        <h2>عناصر الفاتورة</h2>
        {{#items}}
        <p>{{description_ar}} - الكمية: {{quantity}} - السعر: {{unit_price}} - المجموع: {{total_price}}</p>
        {{/items}}
        <h2>المجموع</h2>
        <p>المجموع الفرعي: {{subtotal}}</p>
        <p>الضريبة: {{tax_amount}}</p>
        <p>المجموع الكلي: {{total_amount}}</p>
    </div>',
    true
) ON CONFLICT DO NOTHING;

-- 10. Create function to automatically set invoice number on insert
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set invoice number if it's not already set
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_invoice_number ON invoices;

-- Create trigger
CREATE TRIGGER trigger_set_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- 11. Test the system
DO $$
BEGIN
    RAISE NOTICE 'Invoice system tables created successfully!';
    RAISE NOTICE 'Testing invoice number generation...';
    
    -- Test invoice number generation
    PERFORM generate_invoice_number();
    RAISE NOTICE 'Invoice number generation test passed!';
END $$;
