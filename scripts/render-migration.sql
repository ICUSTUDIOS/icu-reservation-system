-- ═══════════════════════════════════════════════════════════════
-- ICU RESERVATION SYSTEM - RENDER POSTGRESQL MIGRATION
-- Complete database setup for migration from Supabase to Render
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ───────────────────────────────────────────────
--  1. Create auth schema (replacement for Supabase Auth)
-- ───────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS auth;

-- Users table (core authentication)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    email_confirmed_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    confirmation_token VARCHAR(255),
    confirmation_sent_at TIMESTAMPTZ,
    recovery_token VARCHAR(255),
    recovery_sent_at TIMESTAMPTZ,
    email_change_token_new VARCHAR(255),
    email_change VARCHAR(255),
    email_change_sent_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB DEFAULT '{}',
    raw_user_meta_data JSONB DEFAULT '{}',
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    phone VARCHAR(15),
    phone_confirmed_at TIMESTAMPTZ,
    phone_change VARCHAR(15),
    phone_change_token VARCHAR(255),
    phone_change_sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    email_change_confirm_status SMALLINT DEFAULT 0,
    banned_until TIMESTAMPTZ,
    reauthentication_token VARCHAR(255),
    reauthentication_sent_at TIMESTAMPTZ,
    is_sso_user BOOLEAN DEFAULT FALSE
);

-- Sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    factor_id UUID,
    aal VARCHAR(100),
    not_after TIMESTAMPTZ,
    refreshed_at TIMESTAMPTZ,
    user_agent TEXT,
    ip INET,
    tag VARCHAR(100)
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    parent VARCHAR(255),
    session_id UUID REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- ───────────────────────────────────────────────
--  2. Create public schema tables
-- ───────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS public;

-- Members table (user profiles)
CREATE TABLE IF NOT EXISTS public.members (
    auth_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin')),
    monthly_points INT NOT NULL DEFAULT 40,
    monthly_points_max INT NOT NULL DEFAULT 40,
    weekend_slots_used INT NOT NULL DEFAULT 0,
    weekend_slots_max INT NOT NULL DEFAULT 12,
    last_monthly_refresh DATE DEFAULT CURRENT_DATE,
    last_weekly_reset DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(auth_id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    points_cost INT NOT NULL DEFAULT 1,
    slot_type VARCHAR(20) NOT NULL DEFAULT 'weekday' CHECK (slot_type IN ('weekday', 'weekend')),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_time_travel CHECK (end_time > start_time),
    CONSTRAINT reasonable_duration CHECK (end_time - start_time <= INTERVAL '8 hours')
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'waitlisted')),
    studio_usage_purpose TEXT,
    why_join_studio TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point ledger table (transaction history)
CREATE TABLE IF NOT EXISTS public.point_ledger (
    id BIGSERIAL PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES public.members(auth_id) ON DELETE CASCADE,
    delta INT NOT NULL,
    balance_after INT,
    reason VARCHAR(100) NOT NULL,
    ref_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id UUID REFERENCES public.members(auth_id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES public.members(auth_id) ON DELETE SET NULL,
    reported_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    reason VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking slots table (available time slots)
CREATE TABLE IF NOT EXISTS public.booking_slots (
    id BIGSERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────
--  3. Create indexes for performance
-- ───────────────────────────────────────────────
CREATE INDEX idx_bookings_member_id ON public.bookings(member_id);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_end_time ON public.bookings(end_time);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_slot_type ON public.bookings(slot_type);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_email ON public.applications(email);
CREATE INDEX idx_point_ledger_member_id ON public.point_ledger(member_id);
CREATE INDEX idx_point_ledger_created_at ON public.point_ledger(created_at);
CREATE INDEX idx_members_email ON public.members(email);
CREATE INDEX idx_members_role ON public.members(role);
CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_sessions_user_id ON auth.sessions(user_id);

-- ───────────────────────────────────────────────
--  4. Create functions
-- ───────────────────────────────────────────────

-- Calculate booking cost function
CREATE OR REPLACE FUNCTION calculate_booking_cost(start_time TIMESTAMPTZ, end_time TIMESTAMPTZ)
RETURNS TABLE(total_cost INT, is_weekend_booking BOOLEAN, slot_count INT) AS $$
DECLARE
    current_slot TIMESTAMPTZ;
    slot_cost INT;
    total_points INT := 0;
    weekend_slots INT := 0;
    day_of_week INT;
    hour_of_day INT;
BEGIN
    current_slot := start_time;
    
    WHILE current_slot < end_time LOOP
        day_of_week := EXTRACT(ISODOW FROM current_slot);
        hour_of_day := EXTRACT(HOUR FROM current_slot);
        
        -- Weekend pricing: Fri 17:00-24:00 & all day Sat-Sun = 3 points
        IF (day_of_week = 5 AND hour_of_day >= 17) OR day_of_week IN (6, 7) THEN
            slot_cost := 3;
            weekend_slots := weekend_slots + 1;
        ELSE
            slot_cost := 1;
        END IF;
        
        total_points := total_points + slot_cost;
        current_slot := current_slot + INTERVAL '30 minutes';
    END LOOP;
    
    RETURN QUERY SELECT total_points, weekend_slots > 0, weekend_slots;
END;
$$ LANGUAGE plpgsql;

-- Create booking with points function
CREATE OR REPLACE FUNCTION create_booking_with_points(
    p_member_auth_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    booking_cost_info RECORD;
    member_rec public.members%ROWTYPE;
    new_booking_id UUID;
    conflict_count INT;
BEGIN
    -- Get member info
    SELECT * INTO member_rec FROM public.members WHERE auth_id = p_member_auth_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Member not found';
    END IF;
    
    -- Calculate booking cost
    SELECT * INTO booking_cost_info FROM calculate_booking_cost(p_start_time, p_end_time);
    
    -- Check if member has enough points
    IF member_rec.monthly_points < booking_cost_info.total_cost THEN
        RAISE EXCEPTION 'Insufficient points. Need % points, have %', 
                        booking_cost_info.total_cost, member_rec.monthly_points;
    END IF;
    
    -- Check weekend slot limit
    IF booking_cost_info.is_weekend_booking AND 
       (member_rec.weekend_slots_used + booking_cost_info.slot_count) > member_rec.weekend_slots_max THEN
        RAISE EXCEPTION 'Weekend slot limit exceeded';
    END IF;
    
    -- Check for conflicts
    SELECT COUNT(*) INTO conflict_count
    FROM public.bookings
    WHERE status = 'confirmed'
      AND (start_time < p_end_time AND end_time > p_start_time);
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Time slot conflict detected';
    END IF;
    
    -- Create the booking
    INSERT INTO public.bookings (member_id, start_time, end_time, points_cost, slot_type)
    VALUES (p_member_auth_id, p_start_time, p_end_time, 
            booking_cost_info.total_cost,
            CASE WHEN booking_cost_info.is_weekend_booking THEN 'weekend' ELSE 'weekday' END)
    RETURNING id INTO new_booking_id;
    
    -- Update member points and weekend slots
    UPDATE public.members 
    SET monthly_points = monthly_points - booking_cost_info.total_cost,
        weekend_slots_used = CASE 
            WHEN booking_cost_info.is_weekend_booking 
            THEN weekend_slots_used + booking_cost_info.slot_count 
            ELSE weekend_slots_used 
        END,
        updated_at = NOW()
    WHERE auth_id = p_member_auth_id;
    
    -- Log the transaction
    INSERT INTO public.point_ledger (member_id, delta, reason, ref_booking_id)
    VALUES (p_member_auth_id, -booking_cost_info.total_cost, 'create_booking', new_booking_id);
    
    RETURN new_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Cancel booking with refund function
CREATE OR REPLACE FUNCTION cancel_booking_with_refund(
    p_member_auth_id UUID,
    p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
    booking_rec public.bookings%ROWTYPE;
    refund_amount INT;
    hours_until_booking INT;
    is_weekend_booking BOOLEAN;
    weekend_slots_to_refund INT;
BEGIN
    -- Get the booking
    SELECT * INTO booking_rec FROM public.bookings 
    WHERE id = p_booking_id AND member_id = p_member_auth_id AND status = 'confirmed';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or already cancelled';
    END IF;
    
    -- Calculate hours until the booking
    hours_until_booking := EXTRACT(EPOCH FROM (booking_rec.start_time - NOW())) / 3600;
    
    -- Determine refund based on cancellation policy
    IF hours_until_booking >= 24 THEN
        refund_amount := booking_rec.points_cost; -- 100% refund
    ELSE
        refund_amount := CEIL(booking_rec.points_cost * 0.5); -- 50% refund
    END IF;
    
    is_weekend_booking := booking_rec.slot_type = 'weekend';
    
    -- Calculate weekend slots to refund
    IF is_weekend_booking THEN
        SELECT slot_count INTO weekend_slots_to_refund 
        FROM calculate_booking_cost(booking_rec.start_time, booking_rec.end_time);
    ELSE
        weekend_slots_to_refund := 0;
    END IF;
    
    -- Update booking status
    UPDATE public.bookings 
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_booking_id;
    
    -- Refund points to member
    UPDATE public.members 
    SET monthly_points = monthly_points + refund_amount,
        weekend_slots_used = CASE 
            WHEN is_weekend_booking 
            THEN GREATEST(weekend_slots_used - weekend_slots_to_refund, 0) 
            ELSE weekend_slots_used 
        END,
        updated_at = NOW()
    WHERE auth_id = p_member_auth_id;
    
    -- Log the refund
    INSERT INTO public.point_ledger (member_id, delta, reason, ref_booking_id)
    VALUES (p_member_auth_id, refund_amount, 
            CASE WHEN hours_until_booking >= 24 THEN 'cancel_full_refund' ELSE 'cancel_partial_refund' END,
            p_booking_id);
END;
$$ LANGUAGE plpgsql;

-- Monthly points refresh function
CREATE OR REPLACE FUNCTION refresh_monthly_points()
RETURNS VOID AS $$
BEGIN
    UPDATE public.members 
    SET monthly_points = monthly_points_max,
        last_monthly_refresh = CURRENT_DATE,
        updated_at = NOW()
    WHERE last_monthly_refresh < date_trunc('month', CURRENT_DATE)::DATE;
    
    -- Log the refresh
    INSERT INTO public.point_ledger (member_id, delta, reason)
    SELECT auth_id, monthly_points_max - monthly_points, 'monthly_refresh'
    FROM public.members
    WHERE last_monthly_refresh = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Weekly weekend slots reset function
CREATE OR REPLACE FUNCTION reset_weekend_counters()
RETURNS VOID AS $$
BEGIN
    UPDATE public.members 
    SET weekend_slots_used = 0,
        last_weekly_reset = date_trunc('week', CURRENT_DATE)::DATE,
        updated_at = NOW()
    WHERE last_weekly_reset < date_trunc('week', CURRENT_DATE)::DATE;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  5. Create triggers
-- ───────────────────────────────────────────────

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ───────────────────────────────────────────────
--  6. Create views for easier querying
-- ───────────────────────────────────────────────

-- Active bookings view
CREATE OR REPLACE VIEW active_bookings AS
SELECT 
    b.*,
    m.full_name as member_name,
    m.email as member_email
FROM public.bookings b
JOIN public.members m ON b.member_id = m.auth_id
WHERE b.status = 'confirmed'
  AND b.end_time > NOW()
ORDER BY b.start_time;

-- Member stats view
CREATE OR REPLACE VIEW member_stats AS
SELECT 
    m.auth_id,
    m.full_name,
    m.email,
    m.monthly_points,
    m.monthly_points_max,
    m.weekend_slots_used,
    m.weekend_slots_max,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT CASE WHEN b.start_time > NOW() THEN b.id END) as upcoming_bookings
FROM public.members m
LEFT JOIN public.bookings b ON m.auth_id = b.member_id AND b.status = 'confirmed'
GROUP BY m.auth_id, m.full_name, m.email, m.monthly_points, m.monthly_points_max, 
         m.weekend_slots_used, m.weekend_slots_max;

-- ───────────────────────────────────────────────
--  7. Insert default data
-- ───────────────────────────────────────────────

-- Insert default booking slots (9 AM to 9 PM, every day)
INSERT INTO public.booking_slots (start_time, end_time, day_of_week, is_available)
SELECT 
    time '09:00' + (interval '30 minutes' * gs),
    time '09:00' + (interval '30 minutes' * (gs + 1)),
    dow,
    true
FROM generate_series(0, 23) gs  -- 24 half-hour slots
CROSS JOIN generate_series(0, 6) dow  -- 7 days
WHERE time '09:00' + (interval '30 minutes' * gs) < time '21:00'
ON CONFLICT DO NOTHING;

-- ───────────────────────────────────────────────
--  8. Grant permissions
-- ───────────────────────────────────────────────

-- Create application role
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'icu_app') THEN
        CREATE ROLE icu_app WITH LOGIN PASSWORD 'changeme';
    END IF;
END $$;

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO icu_app;
GRANT USAGE ON SCHEMA auth TO icu_app;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO icu_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO icu_app;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO icu_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO icu_app;

-- Grant function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO icu_app;

-- ───────────────────────────────────────────────
--  9. Add comments for documentation
-- ───────────────────────────────────────────────

COMMENT ON SCHEMA public IS 'Main application schema for ICU Reservation System';
COMMENT ON SCHEMA auth IS 'Authentication schema (replacement for Supabase Auth)';
COMMENT ON TABLE public.members IS 'User profiles with points and booking limits';
COMMENT ON TABLE public.bookings IS 'Studio space reservations';
COMMENT ON TABLE public.applications IS 'Membership applications';
COMMENT ON TABLE public.point_ledger IS 'Points transaction history';
COMMENT ON FUNCTION calculate_booking_cost IS 'Calculates points cost for a booking';
COMMENT ON FUNCTION create_booking_with_points IS 'Creates a booking with points validation';
COMMENT ON FUNCTION cancel_booking_with_refund IS 'Cancels booking with refund policy';

-- ═══════════════════════════════════════════════════════════════
-- Migration complete! 
-- Next steps:
-- 1. Update DATABASE_URL in Render environment
-- 2. Migrate existing data from Supabase
-- 3. Update application code to use new database
-- 4. Test all functionality
-- ═══════════════════════════════════════════════════════════════