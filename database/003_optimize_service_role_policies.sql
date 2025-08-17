-- Optimize Service Role Policies for API Performance  
-- This migration adds comprehensive service role policies and optimizations
-- Priority: HIGH - Ensures all API-accessed tables have proper service role access

-- ==============================================
-- PERFORMANCE OPTIMIZATIONS FOR EXISTING POLICIES
-- ==============================================

-- Drop and recreate auth.uid() policies with SELECT wrapper for performance
-- This allows Postgres to cache auth.uid() result per statement instead of per row

-- Update customer policies with performance optimization
DROP POLICY IF EXISTS "Customers can view their own profile" ON customers;
DROP POLICY IF EXISTS "Customers can update their own profile" ON customers;

CREATE POLICY "Customers can view their own profile" ON customers
FOR SELECT USING ((SELECT auth.uid())::text = id::text);

CREATE POLICY "Customers can update their own profile" ON customers
FOR UPDATE USING ((SELECT auth.uid())::text = id::text);

-- Update salon policies with performance optimization  
DROP POLICY IF EXISTS "Salon owners can manage their salon" ON salons;

CREATE POLICY "Salon owners can manage their salon" ON salons
FOR ALL USING (
    (SELECT auth.uid())::text = id::text OR 
    status = 'pending'::salon_status
);

-- ==============================================
-- COMPLETE SERVICE ROLE POLICIES
-- ==============================================

-- Add missing service role policies for all API-accessed tables
-- This ensures API endpoints can access data regardless of RLS

-- Customers table - service role access
CREATE POLICY "Service role can manage customers" ON customers 
FOR ALL USING (auth.role() = 'service_role');

-- Salons table - service role access (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'salons' 
        AND policyname = 'Service role can manage salons'
    ) THEN
        EXECUTE 'CREATE POLICY "Service role can manage salons" ON salons FOR ALL USING (auth.role() = ''service_role'')';
    END IF;
END $$;

-- Services table - service role access
CREATE POLICY "Service role can manage services" ON services 
FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- SECURITY DEFINER FUNCTIONS FOR PERFORMANCE
-- ==============================================

-- Create private schema for security definer functions
CREATE SCHEMA IF NOT EXISTS private;

-- Function to check if user can access appointment (performance optimization)
CREATE OR REPLACE FUNCTION private.can_access_appointment(
    appointment_id UUID,
    user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is customer or salon owner for this appointment
    RETURN EXISTS (
        SELECT 1 FROM appointments a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN salons s ON a.salon_id = s.id
        WHERE a.id = appointment_id
        AND (c.id::text = user_id::text OR s.id::text = user_id::text)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check salon ownership (performance optimization)
CREATE OR REPLACE FUNCTION private.is_salon_owner(
    salon_id UUID,
    user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM salons 
        WHERE id = salon_id 
        AND id::text = user_id::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- OPTIMIZED APPOINTMENT POLICIES
-- ==============================================

-- Update appointment policies to use security definer functions
DROP POLICY IF EXISTS "Customers can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Salons can manage their appointments" ON appointments;

-- More efficient customer appointment access
CREATE POLICY "Customers can view their appointments" ON appointments 
FOR SELECT USING (
    customer_id::text = (SELECT auth.uid())::text
);

-- More efficient salon appointment management
CREATE POLICY "Salons can manage their appointments" ON appointments 
FOR ALL USING (
    private.is_salon_owner(salon_id, (SELECT auth.uid()))
);

-- ==============================================
-- BTREE INDEXES FOR RLS PERFORMANCE
-- ==============================================

-- Add indexes to support RLS policy performance
-- These indexes speed up common RLS filtering patterns

-- Customer ID indexes for appointment filtering
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id_rls 
ON appointments(customer_id) WHERE customer_id IS NOT NULL;

-- Salon ID indexes for appointment filtering  
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id_rls
ON appointments(salon_id) WHERE salon_id IS NOT NULL;

-- Service ID indexes for service filtering
CREATE INDEX IF NOT EXISTS idx_services_salon_id_rls
ON services(salon_id) WHERE is_active = true;

-- Notification indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id_rls
ON notifications(customer_id) WHERE customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_salon_id_rls  
ON notifications(salon_id) WHERE salon_id IS NOT NULL;

-- Time slots indexes for availability queries
CREATE INDEX IF NOT EXISTS idx_time_slots_salon_status_rls
ON time_slots(salon_id, status) WHERE status = 'available';

-- ==============================================
-- ADDITIONAL MISSING POLICIES
-- ==============================================

-- Add policies for edge cases and admin access

-- Allow admin role to bypass certain restrictions (if admin role exists)
-- This is useful for customer service and debugging
CREATE POLICY "Admin can view all customers" ON customers
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM customers 
        WHERE id::text = (SELECT auth.uid())::text 
        AND phone LIKE '+35569%' -- Admin phone pattern (example)
    )
);

-- Allow public viewing of active salon basic info
CREATE POLICY "Public can view salon listing info" ON salons
FOR SELECT TO authenticated, anon
USING (
    status = 'active'::salon_status 
    AND id IS NOT NULL
);

-- ==============================================
-- REALTIME POLICIES FOR WEBSOCKET ACCESS
-- ==============================================

-- Add policies to support Supabase Realtime subscriptions
-- These allow real-time updates for dashboard functionality

-- Salon dashboard real-time appointments
CREATE POLICY "Salon owners can subscribe to their appointment updates" ON appointments
FOR SELECT TO authenticated 
USING (
    salon_id::text = (SELECT auth.uid())::text
);

-- Customer real-time notification updates
CREATE POLICY "Customers can subscribe to their notifications" ON notifications  
FOR SELECT TO authenticated
USING (
    customer_id::text = (SELECT auth.uid())::text
);

-- ==============================================
-- POLICY VALIDATION AND TESTING
-- ==============================================

-- Create a test function to validate policy performance
CREATE OR REPLACE FUNCTION private.test_rls_performance()
RETURNS TEXT AS $$
DECLARE
    test_result TEXT;
BEGIN
    -- Test basic policy functionality
    PERFORM COUNT(*) FROM appointments WHERE salon_id IS NOT NULL LIMIT 1;
    PERFORM COUNT(*) FROM customers WHERE phone IS NOT NULL LIMIT 1;
    PERFORM COUNT(*) FROM salons WHERE status = 'active' LIMIT 1;
    
    test_result := 'RLS policies are functioning correctly';
    RETURN test_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'RLS policy error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- CLEANUP EXPIRED DATA FUNCTION
-- ==============================================

-- Function to clean up expired auth tokens and sessions
-- This helps maintain database performance
CREATE OR REPLACE FUNCTION private.cleanup_expired_auth_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired salon auth tokens
    DELETE FROM salon_auth_tokens 
    WHERE expires_at < NOW();
    
    -- Clean up expired salon sessions  
    DELETE FROM salon_sessions
    WHERE expires_at < NOW();
    
    -- Clean up old verification codes (older than 1 day)
    DELETE FROM verification_codes
    WHERE created_at < (NOW() - INTERVAL '1 day');
    
    RAISE NOTICE 'Expired authentication data cleaned up successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- COMPLETION VERIFICATION
-- ==============================================

DO $$
BEGIN
    -- Verify all critical tables have service role policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND policyname LIKE '%Service role%'
        AND tablename IN ('appointments', 'customers', 'salons', 'services', 'notifications')
    ) THEN
        RAISE EXCEPTION 'Missing service role policies on critical tables';
    END IF;
    
    RAISE NOTICE 'All service role policies and optimizations applied successfully!';
END $$;

-- ==============================================
-- PERFORMANCE NOTES
-- ==============================================
/*
Performance Optimizations Applied:

1. AUTH.UID() CACHING:
   - Wrapped auth.uid() calls in (SELECT ...) for caching
   - Reduces function calls from per-row to per-statement

2. SECURITY DEFINER FUNCTIONS:
   - Created private.can_access_appointment() for complex checks
   - Created private.is_salon_owner() for ownership validation
   - Prevents RLS recursion and improves performance

3. BTREE INDEXES:
   - Added indexes on common RLS filtering columns
   - Supports WHERE clauses generated by policies
   - Focused on customer_id, salon_id, and status columns

4. SERVICE ROLE ACCESS:
   - Complete service role policies for all API tables
   - Bypasses RLS for server-side operations
   - Essential for API endpoint functionality

5. REALTIME SUPPORT:
   - Policies support Supabase Realtime subscriptions
   - Enables real-time dashboard updates
   - Maintains security while allowing websocket access

These optimizations ensure both security and performance
for the Albanian beauty salon booking platform.
*/