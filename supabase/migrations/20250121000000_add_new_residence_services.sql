-- Add new residence services to the database
-- This migration adds support for tourist residence renewal and first-time tourist residence

-- First, update the service_requests constraint to include new service types
ALTER TABLE public.service_requests 
DROP CONSTRAINT IF EXISTS service_requests_service_type_check;

-- Add the new constraint with all allowed service types including new residence services
ALTER TABLE public.service_requests 
ADD CONSTRAINT service_requests_service_type_check 
CHECK (service_type IN (
    'translation',
    'consultation', 
    'legal',
    'health-insurance',
    'travel',
    'government',
    'insurance',
    'tourist-residence-renewal',
    'first-time-tourist-residence',
    'other'
));

-- Create a new table for residence-specific data
CREATE TABLE IF NOT EXISTS public.residence_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    residence_type TEXT NOT NULL CHECK (residence_type IN ('renewal', 'first-time')),
    current_residence_expiry DATE,
    passport_number TEXT,
    passport_expiry_date DATE,
    entry_date DATE,
    intended_duration_months INTEGER,
    accommodation_address TEXT,
    accommodation_type TEXT CHECK (accommodation_type IN ('hotel', 'apartment', 'house', 'other')),
    financial_guarantee_amount DECIMAL(10,2),
    financial_guarantee_source TEXT,
    employment_status TEXT CHECK (employment_status IN ('employed', 'unemployed', 'student', 'retired', 'other')),
    employer_name TEXT,
    employer_address TEXT,
    monthly_income DECIMAL(10,2),
    family_members_count INTEGER DEFAULT 0,
    additional_documents TEXT[], -- Array of document names
    special_requirements TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_residence_requests_user_id ON public.residence_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_residence_requests_service_request_id ON public.residence_requests(service_request_id);
CREATE INDEX IF NOT EXISTS idx_residence_requests_residence_type ON public.residence_requests(residence_type);
CREATE INDEX IF NOT EXISTS idx_residence_requests_status ON public.residence_requests(status);
CREATE INDEX IF NOT EXISTS idx_residence_requests_created_at ON public.residence_requests(created_at);

-- Enable RLS on residence_requests table
ALTER TABLE public.residence_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for residence_requests table
DO $$
BEGIN
    -- Users can view their own residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Users can view their own residence requests') THEN
        CREATE POLICY "Users can view their own residence requests" ON public.residence_requests
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Users can insert their own residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Users can insert their own residence requests') THEN
        CREATE POLICY "Users can insert their own residence requests" ON public.residence_requests
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Users can update their own residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Users can update their own residence requests') THEN
        CREATE POLICY "Users can update their own residence requests" ON public.residence_requests
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Admins can view all residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Admins can view all residence requests') THEN
        CREATE POLICY "Admins can view all residence requests" ON public.residence_requests
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            );
    END IF;

    -- Admins can update all residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Admins can update all residence requests') THEN
        CREATE POLICY "Admins can update all residence requests" ON public.residence_requests
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            );
    END IF;

    -- Users can delete their own residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Users can delete their own residence requests') THEN
        CREATE POLICY "Users can delete their own residence requests" ON public.residence_requests
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Admins can delete all residence requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'residence_requests' AND policyname = 'Admins can delete all residence requests') THEN
        CREATE POLICY "Admins can delete all residence requests" ON public.residence_requests
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
                )
            );
    END IF;
END $$;

-- Create function to handle updated_at trigger for residence_requests
CREATE OR REPLACE FUNCTION public.handle_residence_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for residence_requests updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_residence_requests_updated') THEN
        CREATE TRIGGER on_residence_requests_updated
            BEFORE UPDATE ON public.residence_requests
            FOR EACH ROW EXECUTE FUNCTION public.handle_residence_requests_updated_at();
    END IF;
END $$;

-- Verify the constraint was updated
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.service_requests'::regclass 
AND contype = 'c' 
AND conname = 'service_requests_service_type_check';
