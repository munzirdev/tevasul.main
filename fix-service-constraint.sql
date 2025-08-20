-- Fix service_requests table constraint to allow all service types
-- This fixes the constraint violation error when submitting service requests

-- First, drop the existing constraint
ALTER TABLE public.service_requests 
DROP CONSTRAINT IF EXISTS service_requests_service_type_check;

-- Add the new constraint with all allowed service types
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
    'other'
));

-- Verify the constraint was updated
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.service_requests'::regclass 
AND contype = 'c' 
AND conname = 'service_requests_service_type_check';
