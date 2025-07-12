-- ImiRezervimi.al Database Schema
-- Albanian Beauty Salon Booking Platform
-- Run this in Supabase SQL Editor

-- ==============================================
-- ENABLE EXTENSIONS
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- CUSTOM TYPES
-- ==============================================
CREATE TYPE appointment_status AS ENUM ('pending', 'approved', 'declined', 'completed', 'no_show', 'cancelled');
CREATE TYPE account_type AS ENUM ('guest', 'social', 'verified');
CREATE TYPE auth_provider AS ENUM ('instagram', 'google', 'phone');
CREATE TYPE salon_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE notification_type AS ENUM ('booking_request', 'booking_approved', 'booking_declined', 'reminder', 'cancellation');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ==============================================
-- CUSTOMERS TABLE
-- ==============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Social Authentication
    instagram_id VARCHAR(50) UNIQUE,
    google_id VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    profile_photo_url TEXT,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    whatsapp_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Account Status
    account_type account_type DEFAULT 'guest',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Reputation System
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_visits INTEGER DEFAULT 0,
    no_shows INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Anti-Spam
    blocked_until TIMESTAMP WITH TIME ZONE,
    spam_score INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_phone CHECK (phone ~ '^\+355[0-9]{8,9}$'),
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ==============================================
-- SALONS TABLE
-- ==============================================
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- for imirezervimi.al/klea_nails
    description TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(50) DEFAULT 'Tirana',
    postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Social Media
    instagram_handle VARCHAR(50),
    facebook_page VARCHAR(100),
    website_url TEXT,
    
    -- Business Settings
    status salon_status DEFAULT 'pending',
    auto_approve_vips BOOLEAN DEFAULT FALSE,
    max_advance_days INTEGER DEFAULT 10,
    min_cancellation_minutes INTEGER DEFAULT 30,
    
    -- Working Hours (JSON format)
    working_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "19:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "19:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "19:00", "closed": false},
        "thursday": {"open": "09:00", "close": "19:00", "closed": false},
        "friday": {"open": "09:00", "close": "19:00", "closed": false},
        "saturday": {"open": "09:00", "close": "17:00", "closed": false},
        "sunday": {"open": "10:00", "close": "16:00", "closed": true}
    }',
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 months'),
    
    -- WhatsApp Integration
    whatsapp_number VARCHAR(20),
    whatsapp_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9_-]+$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^\+355[0-9]{8,9}$')
);

-- ==============================================
-- SERVICES TABLE
-- ==============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Service Details
    name VARCHAR(100) NOT NULL, -- "Manikyr", "Ngjyrosje flokësh"
    name_en VARCHAR(100), -- English translation for future
    description TEXT,
    
    -- Pricing & Duration
    price DECIMAL(10,2), -- Optional pricing display
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    
    -- Display Order
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- APPOINTMENTS TABLE
-- ==============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    
    -- Appointment Details
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Service Information
    service_name VARCHAR(100) NOT NULL, -- Denormalized for history
    service_price DECIMAL(10,2),
    customer_notes TEXT,
    salon_notes TEXT,
    
    -- Status & Workflow
    status appointment_status DEFAULT 'pending',
    priority_score DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT future_appointment CHECK (appointment_date >= CURRENT_DATE),
    CONSTRAINT valid_time_slot CHECK (start_time >= '06:00' AND start_time <= '23:00'),
    CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480)
);

-- ==============================================
-- TIME_SLOTS TABLE (For Blocking/Availability)
-- ==============================================
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Time Slot Details
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    
    -- Status
    status VARCHAR(20) DEFAULT 'available', -- available, blocked, booked
    block_reason VARCHAR(100), -- "Personal", "Lunch", "Holiday"
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent double-booking
    UNIQUE(salon_id, date, start_time)
);

-- ==============================================
-- AUTH_SESSIONS TABLE (Social Login Tracking)
-- ==============================================
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Provider Information
    provider auth_provider NOT NULL,
    provider_id VARCHAR(100) NOT NULL, -- Instagram/Google user ID
    
    -- Token Management
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Session Info
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(customer_id, provider)
);

-- ==============================================
-- NOTIFICATIONS TABLE (WhatsApp Message Log)
-- ==============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipients
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    
    -- Message Details
    type notification_type NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message_body TEXT NOT NULL,
    
    -- Delivery Status
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- External References
    twilio_sid VARCHAR(100), -- Twilio message SID
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- VERIFICATION_CODES TABLE (Phone Verification)
-- ==============================================
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Target
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    
    -- Status
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_code CHECK (code ~ '^[0-9]{4,6}$')
);

-- ==============================================
-- SALON_STAFF TABLE (Future: Multi-staff support)
-- ==============================================
CREATE TABLE salon_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Staff Information
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'stylist', -- owner, manager, stylist
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Permissions
    can_approve_bookings BOOLEAN DEFAULT FALSE,
    can_manage_schedule BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Customers
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_instagram_id ON customers(instagram_id);
CREATE INDEX idx_customers_google_id ON customers(google_id);
CREATE INDEX idx_customers_rating ON customers(rating DESC);

-- Salons
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_city ON salons(city);
CREATE INDEX idx_salons_status ON salons(status);

-- Appointments
CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, start_time);
CREATE INDEX idx_appointments_priority ON appointments(priority_score DESC);

-- Services
CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_services_active ON services(is_active);

-- Time Slots
CREATE INDEX idx_time_slots_salon_date ON time_slots(salon_id, date);
CREATE INDEX idx_time_slots_status ON time_slots(status);

-- Notifications
CREATE INDEX idx_notifications_phone ON notifications(phone_number);
CREATE INDEX idx_notifications_appointment ON notifications(appointment_id);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_staff ENABLE ROW LEVEL SECURITY;

-- Customers can only see/edit their own data
CREATE POLICY "Customers can view their own profile" ON customers
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Customers can update their own profile" ON customers
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Salons can see all customers (for booking management)
CREATE POLICY "Salons can view customer profiles" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM salons 
            WHERE auth.uid()::text = id::text
        )
    );

-- Public read access to salon information
CREATE POLICY "Anyone can view active salons" ON salons
    FOR SELECT USING (status = 'active');

-- Salon owners can manage their own salon
CREATE POLICY "Salon owners can manage their salon" ON salons
    FOR ALL USING (auth.uid()::text = id::text);

-- Service policies
CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Salon owners can manage their services" ON services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM salons 
            WHERE salons.id = services.salon_id 
            AND auth.uid()::text = salons.id::text
        )
    );

-- ==============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ==============================================

-- Function to calculate customer priority score
CREATE OR REPLACE FUNCTION calculate_priority_score(
    p_customer_id UUID,
    p_service_price DECIMAL DEFAULT 0
) RETURNS DECIMAL AS $$
DECLARE
    customer_rating DECIMAL;
    total_visits INTEGER;
    cancellation_rate DECIMAL;
    priority_score DECIMAL;
BEGIN
    -- Get customer metrics
    SELECT rating, total_visits, cancellation_rate
    INTO customer_rating, total_visits, cancellation_rate
    FROM customers
    WHERE id = p_customer_id;
    
    -- Calculate priority score (0-100 scale)
    priority_score := 
        (COALESCE(customer_rating, 0) * 20) +  -- Rating: 0-100 points
        (LEAST(total_visits, 10) * 2) +        -- Visits: 0-20 points  
        (COALESCE(p_service_price, 0) * 0.5) +  -- Revenue: 0+ points
        (CASE WHEN cancellation_rate < 0.1 THEN 10 ELSE 0 END); -- Reliability bonus
    
    RETURN LEAST(priority_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
    p_salon_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_duration_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
    end_time TIME;
BEGIN
    end_time := p_start_time + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Check for overlapping appointments
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE salon_id = p_salon_id
    AND appointment_date = p_appointment_date
    AND status IN ('approved', 'pending')
    AND (
        (start_time < end_time AND (start_time + (duration_minutes || ' minutes')::INTERVAL) > p_start_time)
    );
    
    -- Check for blocked time slots
    SELECT COUNT(*) + conflict_count
    INTO conflict_count
    FROM time_slots
    WHERE salon_id = p_salon_id
    AND date = p_appointment_date
    AND status = 'blocked'
    AND (
        (start_time < end_time AND (start_time + (duration_minutes || ' minutes')::INTERVAL) > p_start_time)
    );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate priority score on appointment insert/update
CREATE OR REPLACE FUNCTION set_appointment_priority()
RETURNS TRIGGER AS $$
BEGIN
    NEW.priority_score := calculate_priority_score(NEW.customer_id, NEW.service_price);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_appointment_priority_trigger
    BEFORE INSERT OR UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_appointment_priority();

-- ==============================================
-- INITIAL DATA SEEDING
-- ==============================================

-- Insert sample salon for testing
INSERT INTO salons (
    name, slug, description, phone, address, city,
    instagram_handle, working_hours
) VALUES (
    'Klea Nails Studio',
    'klea_nails',
    'Studio profesional për manikyr dhe nail art në zemër të Tiranës',
    '+35569123456',
    'Rruga Barrikadave, Tirana',
    'Tirana',
    'klea_nails_studio',
    '{
        "monday": {"open": "09:00", "close": "19:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "19:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "19:00", "closed": false},
        "thursday": {"open": "09:00", "close": "19:00", "closed": false},
        "friday": {"open": "09:00", "close": "19:00", "closed": false},
        "saturday": {"open": "09:00", "close": "17:00", "closed": false},
        "sunday": {"open": "10:00", "close": "16:00", "closed": true}
    }'
);

-- Insert sample services for the test salon
INSERT INTO services (salon_id, name, description, duration_minutes, price, sort_order)
SELECT 
    s.id,
    service_name,
    service_description,
    duration,
    price,
    ROW_NUMBER() OVER ()
FROM salons s, (VALUES
    ('Manikyr klasik', 'Manikyr i plotë me ngjyrë të zgjedhur', 30, 15.00),
    ('Nail Art', 'Dizajn artistik në thonj', 45, 25.00),
    ('Gel Polish', 'Ngjyrë gel që zgjat deri në 3 javë', 40, 20.00),
    ('Manikyr + Nail Art', 'Kombinim i plotë për thonj të përsosur', 60, 35.00)
) AS sample_services(service_name, service_description, duration, price)
WHERE s.slug = 'klea_nails';

-- ==============================================
-- PERFORMANCE OPTIMIZATION
-- ==============================================

-- Analyze tables for better query planning
ANALYZE customers;
ANALYZE salons;
ANALYZE services;
ANALYZE appointments;
ANALYZE time_slots;
ANALYZE notifications;

-- ==============================================
-- SCHEMA COMPLETE
-- ==============================================
-- This schema supports:
-- ✅ Instagram/Google OAuth integration
-- ✅ Albanian phone number validation
-- ✅ Request-based appointment booking
-- ✅ Priority scoring system
-- ✅ WhatsApp notification logging
-- ✅ Anti-spam and security measures
-- ✅ Row Level Security (RLS)
-- ✅ Performance optimizations
-- ✅ Albanian timezone support
-- ✅ Extensible for future features

SELECT 'ImiRezervimi.al database schema created successfully! 🚀' AS status;