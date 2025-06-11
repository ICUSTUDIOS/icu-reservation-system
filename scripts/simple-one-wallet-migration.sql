-- ═══════════════════════════════════════════════════════════════
-- SIMPLIFIED ONE-WALLET SYSTEM MIGRATION
-- This script updates the points system to use a single 40-point wallet
-- working with the existing bookings table structure
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────
--  1. Update members table for one-wallet system
-- ───────────────────────────────────────────────

-- Drop old columns and add new ones
DO $$ BEGIN
  -- Remove old two-wallet columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='quiet_points') THEN
    ALTER TABLE public.members DROP COLUMN quiet_points;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='weekend_points') THEN
    ALTER TABLE public.members DROP COLUMN weekend_points;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='quiet_points_max') THEN
    ALTER TABLE public.members DROP COLUMN quiet_points_max;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='weekend_points_max') THEN
    ALTER TABLE public.members DROP COLUMN weekend_points_max;
  END IF;

  -- Add new one-wallet columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='monthly_points') THEN
    ALTER TABLE public.members 
      ADD COLUMN monthly_points INT NOT NULL DEFAULT 40,           -- Current points in wallet
      ADD COLUMN monthly_points_max INT NOT NULL DEFAULT 40,       -- Max points (40)
      ADD COLUMN weekend_slots_used INT NOT NULL DEFAULT 0,        -- Weekend slots used this week
      ADD COLUMN weekend_slots_max INT NOT NULL DEFAULT 6,         -- Max weekend slots per week (6)
      ADD COLUMN last_monthly_refresh DATE DEFAULT CURRENT_DATE,   -- Track monthly refresh
      ADD COLUMN last_weekly_reset DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE; -- Track weekly reset
  END IF;
END $$;

-- ───────────────────────────────────────────────
--  2. Update bookings table for new pricing
-- ───────────────────────────────────────────────

-- Add new columns to bookings table if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='points_cost') THEN
    ALTER TABLE public.bookings 
      ADD COLUMN points_cost INT NOT NULL DEFAULT 1,           -- Cost in points
      ADD COLUMN slot_type TEXT NOT NULL DEFAULT 'weekday';    -- 'weekday' or 'weekend'
  END IF;
END $$;

-- ───────────────────────────────────────────────
--  3. Create pricing calculation function
-- ───────────────────────────────────────────────

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
    
    -- Calculate cost for each 30-minute slot
    WHILE current_slot < end_time LOOP
        day_of_week := EXTRACT(ISODOW FROM current_slot);
        hour_of_day := EXTRACT(HOUR FROM current_slot);
        
        -- Weekend pricing: Fri 17:00-24:00 & all day Sat-Sun = 3 points
        IF (day_of_week = 5 AND hour_of_day >= 17) OR day_of_week IN (6, 7) THEN
            slot_cost := 3; -- Weekend rate
            weekend_slots := weekend_slots + 1;
        ELSE
            slot_cost := 1; -- Weekday rate
        END IF;
        
        total_points := total_points + slot_cost;
        current_slot := current_slot + INTERVAL '30 minutes';
    END LOOP;
    
    RETURN QUERY SELECT total_points, weekend_slots > 0, weekend_slots;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  4. Create enhanced booking creation function
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_booking_with_points(
    p_member_auth_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    booking_cost_info RECORD;
    member_rec members%ROWTYPE;
    new_booking_id UUID;
    conflict_count INT;
BEGIN
    -- Get member info
    SELECT * INTO member_rec FROM members WHERE auth_id = p_member_auth_id;
    
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
    
    -- Check weekend slot limit if this is a weekend booking
    IF booking_cost_info.is_weekend_booking AND 
       (member_rec.weekend_slots_used + booking_cost_info.slot_count) > member_rec.weekend_slots_max THEN
        RAISE EXCEPTION 'Weekend slot limit exceeded. Would use % slots, have % remaining', 
                        booking_cost_info.slot_count, 
                        (member_rec.weekend_slots_max - member_rec.weekend_slots_used);
    END IF;
    
    -- Check for conflicts
    SELECT COUNT(*) INTO conflict_count
    FROM bookings
    WHERE (start_time < p_end_time AND end_time > p_start_time);
    
    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Time slot conflict detected';
    END IF;
    
    -- Create the booking
    INSERT INTO bookings (member_id, start_time, end_time, points_cost, slot_type)
    VALUES (p_member_auth_id, p_start_time, p_end_time, 
            booking_cost_info.total_cost,
            CASE WHEN booking_cost_info.is_weekend_booking THEN 'weekend' ELSE 'weekday' END)
    RETURNING id INTO new_booking_id;
    
    -- Deduct points from member's wallet
    UPDATE members 
    SET monthly_points = monthly_points - booking_cost_info.total_cost,
        weekend_slots_used = CASE 
            WHEN booking_cost_info.is_weekend_booking 
            THEN weekend_slots_used + booking_cost_info.slot_count 
            ELSE weekend_slots_used 
        END,
        updated_at = NOW()
    WHERE auth_id = p_member_auth_id;
    
    -- Log the transaction
    INSERT INTO point_ledger (member_id, delta, reason, ref_booking_id)
    VALUES (p_member_auth_id, -booking_cost_info.total_cost, 'create_booking', new_booking_id);
    
    RETURN new_booking_id;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  5. Create enhanced booking cancellation function
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cancel_booking_with_refund(
    p_member_auth_id UUID,
    p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
    booking_rec bookings%ROWTYPE;
    refund_amount INT;
    hours_until_booking INT;
    is_weekend_booking BOOLEAN;
    weekend_slots_to_refund INT;
BEGIN
    -- Get the booking
    SELECT * INTO booking_rec FROM bookings 
    WHERE id = p_booking_id AND member_id = p_member_auth_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or does not belong to member';
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
    
    -- Calculate weekend slots to refund (if applicable)
    IF is_weekend_booking THEN
        SELECT slot_count INTO weekend_slots_to_refund 
        FROM calculate_booking_cost(booking_rec.start_time, booking_rec.end_time);
    ELSE
        weekend_slots_to_refund := 0;
    END IF;
    
    -- Delete the booking
    DELETE FROM bookings WHERE id = p_booking_id;
    
    -- Refund points to member's wallet
    UPDATE members 
    SET monthly_points = monthly_points + refund_amount,
        weekend_slots_used = CASE 
            WHEN is_weekend_booking 
            THEN GREATEST(weekend_slots_used - weekend_slots_to_refund, 0) 
            ELSE weekend_slots_used 
        END,
        updated_at = NOW()
    WHERE auth_id = p_member_auth_id;
    
    -- Log the refund
    INSERT INTO point_ledger (member_id, delta, reason, ref_booking_id)
    VALUES (p_member_auth_id, refund_amount, 
            CASE WHEN hours_until_booking >= 24 THEN 'cancel_full_refund' ELSE 'cancel_partial_refund' END,
            p_booking_id);
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  6. Create monthly refresh function
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION refresh_monthly_points()
RETURNS VOID AS $$
BEGIN
    -- Refresh points for all members on the 1st of each month
    UPDATE members 
    SET monthly_points = monthly_points_max,
        last_monthly_refresh = CURRENT_DATE,
        updated_at = NOW()
    WHERE last_monthly_refresh < date_trunc('month', CURRENT_DATE)::DATE;
    
    -- Log the refresh for each affected member
    INSERT INTO point_ledger (member_id, delta, reason)
    SELECT auth_id, monthly_points_max - (monthly_points - monthly_points_max), 'monthly_refresh'
    FROM members
    WHERE last_monthly_refresh = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  7. Create weekly reset function
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reset_weekend_counters()
RETURNS VOID AS $$
BEGIN
    -- Reset weekend slot counters every Monday
    UPDATE members 
    SET weekend_slots_used = 0,
        last_weekly_reset = date_trunc('week', CURRENT_DATE)::DATE,
        updated_at = NOW()
    WHERE last_weekly_reset < date_trunc('week', CURRENT_DATE)::DATE;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  8. Update existing data to new format
-- ───────────────────────────────────────────────

-- Migrate existing members to new format
UPDATE members 
SET monthly_points = COALESCE(wallet_points, 40),
    monthly_points_max = 40,
    weekend_slots_used = 0, -- Reset to 0 since we're changing the system
    weekend_slots_max = 6,
    last_monthly_refresh = CURRENT_DATE,
    last_weekly_reset = date_trunc('week', CURRENT_DATE)::DATE,
    updated_at = NOW()
WHERE monthly_points IS NULL;

-- Update existing bookings with estimated costs (simple estimation)
UPDATE bookings 
SET points_cost = CASE 
    WHEN EXTRACT(ISODOW FROM start_time) IN (6, 7) OR 
         (EXTRACT(ISODOW FROM start_time) = 5 AND EXTRACT(HOUR FROM start_time) >= 17) 
    THEN 3 * CEIL(EXTRACT(EPOCH FROM (end_time - start_time)) / 1800) -- Weekend: 3 points per 30 min
    ELSE 1 * CEIL(EXTRACT(EPOCH FROM (end_time - start_time)) / 1800)     -- Weekday: 1 point per 30 min
END,
slot_type = CASE 
    WHEN EXTRACT(ISODOW FROM start_time) IN (6, 7) OR 
         (EXTRACT(ISODOW FROM start_time) = 5 AND EXTRACT(HOUR FROM start_time) >= 17) 
    THEN 'weekend'
    ELSE 'weekday'
END
WHERE points_cost IS NULL OR points_cost = 0;

-- Clean up old columns if they exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='wallet_points') THEN
    ALTER TABLE public.members DROP COLUMN wallet_points;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='red_points_week') THEN
    ALTER TABLE public.members DROP COLUMN red_points_week;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='red_cap_week') THEN
    ALTER TABLE public.members DROP COLUMN red_cap_week;
  END IF;
  
  -- Remove old band column from bookings if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='band') THEN
    ALTER TABLE public.bookings DROP COLUMN band;
  END IF;
END $$;

COMMENT ON TABLE members IS 'Updated for one-wallet system: single 40-point monthly wallet with weekend slot counter';
COMMENT ON FUNCTION calculate_booking_cost IS 'Calculates total cost for a booking: 1 point for weekdays, 3 points for weekends (Fri 17:00+ and Sat-Sun)';
COMMENT ON FUNCTION create_booking_with_points IS 'Creates booking with point deduction and weekend slot tracking';
COMMENT ON FUNCTION cancel_booking_with_refund IS 'Cancels booking with appropriate refund: 100% if >24h notice, 50% if <24h notice';
