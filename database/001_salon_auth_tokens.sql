-- Migration 001: Salon Authentication Tokens
-- Create salon authentication tokens table
-- This table stores magic link tokens for salon login
-- Priority: HIGH - Required for salon dashboard access

-- ==============================================
-- SALON AUTH TOKENS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS salon_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_salon_auth_tokens_token ON salon_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_salon_auth_tokens_salon_id ON salon_auth_tokens(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_auth_tokens_phone ON salon_auth_tokens(phone);
CREATE INDEX IF NOT EXISTS idx_salon_auth_tokens_expires_at ON salon_auth_tokens(expires_at);

-- Add RLS policies for security
ALTER TABLE salon_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow service role to manage auth tokens
CREATE POLICY "Service role can manage salon auth tokens" ON salon_auth_tokens
FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- SALON SESSIONS TABLE
-- ==============================================

-- Create salon sessions table for persistent login sessions
CREATE TABLE IF NOT EXISTS salon_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for salon sessions
CREATE INDEX IF NOT EXISTS idx_salon_sessions_token ON salon_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_salon_sessions_salon_id ON salon_sessions(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_sessions_expires_at ON salon_sessions(expires_at);

-- Add RLS for salon sessions
ALTER TABLE salon_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow service role to manage sessions
CREATE POLICY "Service role can manage salon sessions" ON salon_sessions
FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- CLEANUP FUNCTIONS
-- ==============================================

-- Function to clean up expired tokens and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_salon_auth()
RETURNS void AS $$
BEGIN
  -- Delete expired auth tokens
  DELETE FROM salon_auth_tokens WHERE expires_at < NOW();
  
  -- Delete expired sessions
  DELETE FROM salon_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for salon_auth_tokens
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_salon_auth_tokens_updated_at ON salon_auth_tokens;
CREATE TRIGGER update_salon_auth_tokens_updated_at
    BEFORE UPDATE ON salon_auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Verify tables were created
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ Created' ELSE '❌ Missing' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('salon_auth_tokens', 'salon_sessions');

-- ==============================================
-- MIGRATION COMPLETE
-- ==============================================
-- This migration enables secure salon authentication via:
-- 1. Magic link tokens with expiration
-- 2. Persistent session management  
-- 3. Automated cleanup of expired data
-- 4. Row Level Security for API access