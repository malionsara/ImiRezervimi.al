-- Migration 006: Create salon command log table for WhatsApp webhook rate limiting
-- Albanian Beauty Salon Booking Platform

-- Create salon command log table for WhatsApp webhook rate limiting
CREATE TABLE IF NOT EXISTS salon_command_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_phone TEXT NOT NULL,
  command TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_salon_command_log_phone_created 
ON salon_command_log (salon_phone, created_at DESC);

-- Add RLS policy
ALTER TABLE salon_command_log ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY salon_command_log_service_role ON salon_command_log
FOR ALL USING (auth.role() = 'service_role');

-- Policy: Authenticated users can't access command logs (privacy)
CREATE POLICY salon_command_log_no_user_access ON salon_command_log
FOR ALL USING (FALSE);