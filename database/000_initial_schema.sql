-- Initial Database Schema for ImiRezervimi.al
-- Albanian Beauty Salon Booking Platform
-- Migration: 000 - Initial Schema Setup
-- Applied: Manual setup (pre-migration system)

-- This file represents the initial schema that was manually applied
-- It's included here for reference and to establish migration baseline

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

-- ==============================================
-- CORE TABLES
-- ==============================================

-- CUSTOMERS TABLE
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
    
    -- Constraints
    CONSTRAINT valid_phone CHECK (phone ~ '^\+355[0-9]{8,9}$'),
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- SALONS TABLE
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
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

-- SERVICES TABLE
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Service Details
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    
    -- Pricing & Duration
    price DECIMAL(10,2),
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

-- APPOINTMENTS TABLE
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
    service_name VARCHAR(100) NOT NULL,
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

-- Supporting tables and functions would continue here...
-- (Abbreviated for migration file length)

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Customer indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_instagram_id ON customers(instagram_id);
CREATE INDEX idx_customers_google_id ON customers(google_id);

-- Salon indexes
CREATE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_status ON salons(status);

-- Appointment indexes
CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ==============================================
-- BASIC FUNCTIONS
-- ==============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Basic priority score calculation
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
    SELECT rating, total_visits, cancellation_rate
    INTO customer_rating, total_visits, cancellation_rate
    FROM customers
    WHERE id = p_customer_id;
    
    priority_score := 
        (COALESCE(customer_rating, 0) * 20) +
        (LEAST(total_visits, 10) * 2) +
        (COALESCE(p_service_price, 0) * 0.5) +
        (CASE WHEN cancellation_rate < 0.1 THEN 10 ELSE 0 END);
    
    RETURN LEAST(priority_score, 100);
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Basic initial policies (to be enhanced in later migrations)
CREATE POLICY "Anyone can view active salons" ON salons
    FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view active services" ON services
    FOR SELECT USING (is_active = true);

-- ==============================================
-- MIGRATION TRACKING SETUP
-- ==============================================

-- This establishes the baseline for future migrations
-- Migration 000: Initial schema (manually applied)
-- Migration 001: Salon auth tokens (already applied)
-- Migration 002: Critical RLS policies (already applied)
-- Migration 003: Service role optimizations (already applied)