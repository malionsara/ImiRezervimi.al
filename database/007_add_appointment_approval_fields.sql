-- Migration 007: Add missing appointment approval fields
-- Albanian Beauty Salon Booking Platform

-- Add approval method tracking column
ALTER TABLE appointments 
ADD COLUMN approval_method TEXT DEFAULT 'dashboard';

-- Add approval timestamp columns
ALTER TABLE appointments 
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE appointments 
ADD COLUMN declined_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN appointments.approval_method IS 'Method used to approve/decline appointment: dashboard, whatsapp, api';
COMMENT ON COLUMN appointments.approved_at IS 'Timestamp when appointment was approved';
COMMENT ON COLUMN appointments.declined_at IS 'Timestamp when appointment was declined';