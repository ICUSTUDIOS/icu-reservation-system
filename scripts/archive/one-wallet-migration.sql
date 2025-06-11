-- ═══════════════════════════════════════════════════════════════
-- ONE-WALLET SYSTEM MIGRATION
-- This script updates the points system to use a single 40-point wallet
-- with weekend slot counter instead of separate wallets
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
      ADD COLUMN weekend_slots_max INT NOT NULL DEFAULT 12,        -- Max weekend slots per week (12)
      ADD COLUMN last_monthly_refresh DATE DEFAULT CURRENT_DATE,   -- Track monthly refresh
      ADD COLUMN last_weekly_reset DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE; -- Track weekly reset
  END IF;
END $$;

-- ───────────────────────────────────────────────
--  2. Update booking_slots table for new pricing
-- ───────────────────────────────────────────────

-- Update points_cost calculation based on new pricing model
DO $$ BEGIN
  -- Add slot_type column to track weekend vs weekday
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='booking_slots' AND column_name='slot_type') THEN
    ALTER TABLE public.booking_slots 
      ADD COLUMN slot_type TEXT NOT NULL DEFAULT 'weekday'; -- 'weekday' or 'weekend'
  END IF;
END $$;

-- ───────────────────────────────────────────────
--  3. Update pricing function
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_slot_cost(slot_time TIMESTAMPTZ)
RETURNS INT AS $$
DECLARE
    day_of_week INT;
    hour_of_day INT;
BEGIN
    -- Extract day of week (1=Monday, 7=Sunday) and hour
    day_of_week := EXTRACT(ISODOW FROM slot_time);
    hour_of_day := EXTRACT(HOUR FROM slot_time);
    
    -- Weekend pricing: Fri 17:00-24:00 & all day Sat-Sun = 3 points
    IF (day_of_week = 5 AND hour_of_day >= 17) OR day_of_week IN (6, 7) THEN
        RETURN 3; -- Weekend rate
    ELSE
        RETURN 1; -- Weekday rate (Mon-Thu all day, Fri before 17:00)
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  4. Update reserve_slot function for one-wallet
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reserve_slot(
    p_member_auth_id UUID,
    p_booking_slot_id UUID
)
RETURNS SETOF booking_slots AS $$
DECLARE
    slot_rec booking_slots%ROWTYPE;
    member_rec members%ROWTYPE;
    slot_cost INT;
    is_weekend_slot BOOLEAN;
BEGIN
    -- Get the booking slot
    SELECT * INTO slot_rec FROM booking_slots WHERE id = p_booking_slot_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking slot not found';
    END IF;
    
    -- Check if slot is available
    IF slot_rec.status != 'available' THEN
        RAISE EXCEPTION 'Slot is not available';
    END IF;
    
    -- Get member info
    SELECT * INTO member_rec FROM members WHERE auth_id = p_member_auth_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Member not found';
    END IF;
    
    -- Calculate cost and check if it's a weekend slot
    slot_cost := calculate_slot_cost(slot_rec.slot_time);
    is_weekend_slot := slot_cost = 3;
    
    -- Check if member has enough points
    IF member_rec.monthly_points < slot_cost THEN
        RAISE EXCEPTION 'Insufficient points. Need % points, have %', slot_cost, member_rec.monthly_points;
    END IF;
    
    -- Check weekend slot limit
    IF is_weekend_slot AND member_rec.weekend_slots_used >= member_rec.weekend_slots_max THEN
        RAISE EXCEPTION 'Weekend slot limit reached. You have used % of % weekend slots this week', 
                        member_rec.weekend_slots_used, member_rec.weekend_slots_max;
    END IF;
    
    -- Reserve the slot
    UPDATE booking_slots 
    SET status = 'booked', 
        member_id = p_member_auth_id,
        points_cost = slot_cost,
        slot_type = CASE WHEN is_weekend_slot THEN 'weekend' ELSE 'weekday' END,
        updated_at = NOW()
    WHERE id = p_booking_slot_id;
    
    -- Deduct points from member's wallet
    UPDATE members 
    SET monthly_points = monthly_points - slot_cost,
        weekend_slots_used = CASE WHEN is_weekend_slot THEN weekend_slots_used + 1 ELSE weekend_slots_used END,
        updated_at = NOW()
    WHERE auth_id = p_member_auth_id;
    
    -- Log the transaction
    INSERT INTO point_ledger (member_id, delta, reason, ref_booking_id)
    VALUES (p_member_auth_id, -slot_cost, 'reserve_slot', p_booking_slot_id);
    
    -- Return the updated slot
    SELECT * INTO slot_rec FROM booking_slots WHERE id = p_booking_slot_id;
    RETURN NEXT slot_rec;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  5. Update cancel_slot function for new refund rules
-- ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cancel_slot(
    p_member_auth_id UUID,
    p_booking_slot_id UUID
)
RETURNS SETOF booking_slots AS $$
DECLARE
    slot_rec booking_slots%ROWTYPE;
    hours_until_slot INT;
    refund_amount INT;
    is_weekend_slot BOOLEAN;
BEGIN
    -- Get the booking slot
    SELECT * INTO slot_rec FROM booking_slots WHERE id = p_booking_slot_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking slot not found';
    END IF;
    
    -- Check if slot belongs to the member
    IF slot_rec.member_id != p_member_auth_id THEN
        RAISE EXCEPTION 'You can only cancel your own bookings';
    END IF;
    
    -- Calculate hours until the slot
    hours_until_slot := EXTRACT(EPOCH FROM (slot_rec.slot_time - NOW())) / 3600;
    
    -- Determine refund based on cancellation policy
    IF hours_until_slot >= 24 THEN
        refund_amount := slot_rec.points_cost; -- 100% refund
    ELSE
        refund_amount := CEIL(slot_rec.points_cost * 0.5); -- 50% refund
    END IF;
    
    is_weekend_slot := slot_rec.slot_type = 'weekend';
    
    -- Cancel the slot
    UPDATE booking_slots 
    SET status = 'available', 
        member_id = NULL,
        updated_at = NOW()
    WHERE id = p_booking_slot_id;
    
    -- Refund points to member's wallet
    UPDATE members 
    SET monthly_points = monthly_points + refund_amount,
        weekend_slots_used = CASE WHEN is_weekend_slot THEN GREATEST(weekend_slots_used - 1, 0) ELSE weekend_slots_used END,
        updated_at = NOW()
    WHERE auth_id = p_member_auth_id;
    
    -- Log the refund
    INSERT INTO point_ledger (member_id, delta, reason, ref_booking_id)
    VALUES (p_member_auth_id, refund_amount, 
            CASE WHEN hours_until_slot >= 24 THEN 'cancel_full_refund' ELSE 'cancel_partial_refund' END,
            p_booking_slot_id);
    
    -- Return the updated slot
    SELECT * INTO slot_rec FROM booking_slots WHERE id = p_booking_slot_id;
    RETURN NEXT slot_rec;
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
--  8. Create automatic refresh triggers/scheduled jobs
-- ───────────────────────────────────────────────

-- Note: In production, you would set up cron jobs or scheduled functions
-- For now, we'll create a function that can be called manually or via cron

CREATE OR REPLACE FUNCTION run_scheduled_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Run monthly refresh if it's the 1st of the month
    IF EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
        PERFORM refresh_monthly_points();
    END IF;
    
    -- Run weekly reset if it's Monday
    IF EXTRACT(ISODOW FROM CURRENT_DATE) = 1 THEN
        PERFORM reset_weekend_counters();
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────
--  9. Update existing data to new format
-- ───────────────────────────────────────────────

-- Migrate existing members to new format
UPDATE members 
SET monthly_points = COALESCE(wallet_points, 40),
    monthly_points_max = 40,
    weekend_slots_used = COALESCE(red_points_week, 0),
    weekend_slots_max = 6,
    last_monthly_refresh = CURRENT_DATE,
    last_weekly_reset = date_trunc('week', CURRENT_DATE)::DATE,
    updated_at = NOW()
WHERE monthly_points IS NULL;

-- Clean up old columns
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
END $$;

-- ───────────────────────────────────────────────
--  10. Update RLS policies
-- ───────────────────────────────────────────────

-- Members can view and update their own records
DROP POLICY IF EXISTS "members_select_own" ON public.members;
CREATE POLICY "members_select_own" ON public.members
  FOR SELECT USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "members_update_own" ON public.members;
CREATE POLICY "members_update_own" ON public.members
  FOR UPDATE USING (auth_id = auth.uid());

-- Point ledger policies
DROP POLICY IF EXISTS "point_ledger_select_own" ON public.point_ledger;
CREATE POLICY "point_ledger_select_own" ON public.point_ledger
  FOR SELECT USING (member_id = auth.uid());

DROP POLICY IF EXISTS "point_ledger_insert_own" ON public.point_ledger;
CREATE POLICY "point_ledger_insert_own" ON public.point_ledger
  FOR INSERT WITH CHECK (member_id = auth.uid());

COMMENT ON TABLE members IS 'Updated for one-wallet system: single 40-point monthly wallet with weekend slot counter';
COMMENT ON FUNCTION calculate_slot_cost IS 'Returns 1 point for weekdays, 3 points for weekends (Fri 17:00+ and Sat-Sun)';
COMMENT ON FUNCTION refresh_monthly_points IS 'Refills all member wallets to 40 points on the 1st of each month';
COMMENT ON FUNCTION reset_weekend_counters IS 'Resets weekend slot counters to 0 every Monday';
