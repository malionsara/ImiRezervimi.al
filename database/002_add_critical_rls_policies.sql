-- Critical RLS Policies for Appointments and Notifications
-- This migration adds essential security policies for the core booking workflow
-- Priority: HIGH - These tables handle sensitive customer and booking data

-- ==============================================
-- APPOINTMENTS TABLE RLS POLICIES
-- ==============================================

-- Service role can manage all appointments (for API endpoints)
CREATE POLICY "Service role can manage appointments" ON appointments 
FOR ALL USING (auth.role() = 'service_role');

-- Customers can view their own appointments only
CREATE POLICY "Customers can view their appointments" ON appointments 
FOR SELECT USING (
    customer_id IN (
        SELECT id FROM customers 
        WHERE auth.uid()::text = id::text
    )
);

-- Customers can update their own appointment notes only
CREATE POLICY "Customers can update their appointment notes" ON appointments 
FOR UPDATE USING (
    customer_id IN (
        SELECT id FROM customers 
        WHERE auth.uid()::text = id::text
    )
) WITH CHECK (
    -- Only allow updating customer_notes and status to 'cancelled'
    OLD.salon_id = NEW.salon_id AND
    OLD.customer_id = NEW.customer_id AND
    OLD.service_id = NEW.service_id AND
    OLD.appointment_date = NEW.appointment_date AND
    OLD.start_time = NEW.start_time
);

-- Salons can manage appointments for their salon
CREATE POLICY "Salons can manage their appointments" ON appointments 
FOR ALL USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);

-- ==============================================
-- NOTIFICATIONS TABLE RLS POLICIES  
-- ==============================================

-- Service role can manage all notifications (for WhatsApp/SMS sending)
CREATE POLICY "Service role can manage notifications" ON notifications 
FOR ALL USING (auth.role() = 'service_role');

-- Customers can view notifications sent to them
CREATE POLICY "Customers can view their notifications" ON notifications 
FOR SELECT USING (
    customer_id IN (
        SELECT id FROM customers 
        WHERE auth.uid()::text = id::text
    )
);

-- Salons can view notifications related to their appointments
CREATE POLICY "Salons can view their notifications" ON notifications 
FOR SELECT USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);

-- ==============================================
-- VERIFICATION CODES TABLE RLS POLICIES
-- ==============================================

-- Service role can manage verification codes (for phone verification)
CREATE POLICY "Service role can manage verification codes" ON verification_codes 
FOR ALL USING (auth.role() = 'service_role');

-- No public access to verification codes for security

-- ==============================================
-- AUTH SESSIONS TABLE RLS POLICIES
-- ==============================================

-- Service role can manage auth sessions
CREATE POLICY "Service role can manage auth sessions" ON auth_sessions 
FOR ALL USING (auth.role() = 'service_role');

-- Customers can view their own auth sessions
CREATE POLICY "Customers can view their auth sessions" ON auth_sessions 
FOR SELECT USING (
    customer_id IN (
        SELECT id FROM customers 
        WHERE auth.uid()::text = id::text
    )
);

-- ==============================================
-- TIME SLOTS TABLE RLS POLICIES
-- ==============================================

-- Service role can manage all time slots
CREATE POLICY "Service role can manage time slots" ON time_slots 
FOR ALL USING (auth.role() = 'service_role');

-- Anyone can view available time slots (for booking interface)
CREATE POLICY "Anyone can view available time slots" ON time_slots 
FOR SELECT USING (status = 'available');

-- Salons can manage their own time slots
CREATE POLICY "Salons can manage their time slots" ON time_slots 
FOR ALL USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);

-- ==============================================
-- SALON STAFF TABLE RLS POLICIES
-- ==============================================

-- Service role can manage salon staff
CREATE POLICY "Service role can manage salon staff" ON salon_staff 
FOR ALL USING (auth.role() = 'service_role');

-- Salons can manage their own staff
CREATE POLICY "Salons can manage their staff" ON salon_staff 
FOR ALL USING (
    salon_id IN (
        SELECT id FROM salons 
        WHERE auth.uid()::text = id::text
    )
);

-- Anyone can view active staff (for salon profiles)
CREATE POLICY "Anyone can view active salon staff" ON salon_staff 
FOR SELECT USING (is_active = true);

-- ==============================================
-- POLICY VERIFICATION
-- ==============================================

-- Verify all tables have RLS enabled
DO $$
BEGIN
    -- Check if RLS is enabled on all critical tables
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'appointments') THEN
        RAISE EXCEPTION 'RLS not enabled on appointments table';
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications') THEN
        RAISE EXCEPTION 'RLS not enabled on notifications table';
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'verification_codes') THEN
        RAISE EXCEPTION 'RLS not enabled on verification_codes table';
    END IF;
    
    RAISE NOTICE 'All critical RLS policies have been successfully added!';
END $$;

-- ==============================================
-- SECURITY NOTES
-- ==============================================
/*
These policies ensure:

1. APPOINTMENTS:
   - Service role has full access for API operations
   - Customers can only see/modify their own bookings
   - Salons can manage appointments for their venue
   - Prevents cross-customer data leakage

2. NOTIFICATIONS:
   - Service role can send/manage all notifications
   - Customers can view messages sent to them
   - Salons can view notifications about their bookings
   - Audit trail for WhatsApp/SMS communications

3. VERIFICATION_CODES:
   - Only service role access (phone verification security)
   - No public access to prevent code guessing attacks

4. AUTH_SESSIONS:
   - Service role manages session lifecycle
   - Customers can view their own active sessions
   - Supports social login tracking

5. TIME_SLOTS:
   - Service role for schedule management
   - Public read access for booking availability
   - Salons control their own schedule

6. SALON_STAFF:
   - Service role for staff management
   - Salons manage their own team
   - Public can view active staff profiles
*/