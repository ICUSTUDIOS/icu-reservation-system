-- ───────────────────────────────────────────────
--  1. Create booking_slots table
--  This table holds pre-defined, bookable time slots.
-- ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.booking_slots (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_time      TIMESTAMPTZ NOT NULL UNIQUE, -- Start time of the 30-min slot
  band           TEXT NOT NULL DEFAULT 'green', -- 'green', 'yellow', 'red'
  points_cost    INT NOT NULL DEFAULT 1,      -- Cost in points (1, 2, or 3)
  status         TEXT NOT NULL DEFAULT 'free',  -- 'free', 'confirmed', 'unavailable'
  member_id      UUID REFERENCES public.members(auth_id) ON DELETE SET NULL, -- Who booked it
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Add a constraint to ensure band and points_cost are consistent
ALTER TABLE public.booking_slots
  DROP CONSTRAINT IF EXISTS chk_band_cost,
  ADD CONSTRAINT chk_band_cost CHECK (
    (band = 'green' AND points_cost = 1) OR
    (band = 'yellow' AND points_cost = 2) OR
    (band = 'red' AND points_cost = 3)
  );

-- Add a constraint for status values
ALTER TABLE public.booking_slots
  DROP CONSTRAINT IF EXISTS chk_status_values,
  ADD CONSTRAINT chk_status_values CHECK (status IN ('free', 'confirmed', 'unavailable'));


-- ───────────────────────────────────────────────
--  2. Create indexes for performance
-- ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_booking_slots_slot_time ON public.booking_slots(slot_time);
CREATE INDEX IF NOT EXISTS idx_booking_slots_status ON public.booking_slots(status);
CREATE INDEX IF NOT EXISTS idx_booking_slots_member_id ON public.booking_slots(member_id);

-- ───────────────────────────────────────────────
--  3. Enable RLS
-- ───────────────────────────────────────────────
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────
--  4. Create RLS policies
-- ───────────────────────────────────────────────
-- Allow public read access to free slots and basic info of booked ones
DROP POLICY IF EXISTS "Allow public read access to booking_slots" ON public.booking_slots;
CREATE POLICY "Allow public read access to booking_slots" ON public.booking_slots
  FOR SELECT USING (true); -- Users can see slot times, band, cost, status. Member_id might be restricted if needed.

-- Allow authenticated users to call reserve_slot (which handles writes)
-- Direct inserts/updates/deletes might be restricted to admin/service_role or specific functions.
DROP POLICY IF EXISTS "Allow members to update their own bookings via functions" ON public.booking_slots;
CREATE POLICY "Allow members to update their own bookings via functions" ON public.booking_slots
  FOR UPDATE USING (auth.uid() = member_id); -- This allows updates if done through a function checking auth.uid()

-- Example: Allow service_role to manage slots (e.g., for generation, admin overrides)
DROP POLICY IF EXISTS "Allow service_role full access" ON public.booking_slots;
CREATE POLICY "Allow service_role full access" ON public.booking_slots
  FOR ALL USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role');


-- ───────────────────────────────────────────────
--  5. Optional: Function to populate slots (example for one day)
--  You'd run this periodically or as needed.
-- ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.populate_daily_slots(p_date DATE)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_slot_time TIMESTAMPTZ;
  v_hour INT;
  v_band TEXT;
  v_cost INT;
  v_day_of_week INT; -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);

  FOR v_hour IN 9..20 LOOP -- 9 AM to 8:30 PM (slots are 30 min)
    -- .00 slot
    v_slot_time := make_timestamp(
      EXTRACT(YEAR FROM p_date)::INT,
      EXTRACT(MONTH FROM p_date)::INT,
      EXTRACT(DAY FROM p_date)::INT,
      v_hour, 0, 0
    );

    -- Determine band and cost (example logic, adjust as needed)
    IF v_day_of_week >= 1 AND v_day_of_week <= 4 THEN -- Mon-Thu
      IF v_hour < 18 THEN -- Daytime
        v_band := 'green'; v_cost := 1;
      ELSE -- Evening
        v_band := 'yellow'; v_cost := 2;
      END IF;
    ELSIF v_day_of_week = 5 THEN -- Friday
      IF v_hour < 18 THEN -- Daytime
        v_band := 'yellow'; v_cost := 2;
      ELSE -- Night
        v_band := 'red'; v_cost := 3;
      END IF;
    ELSE -- Saturday, Sunday (Weekend)
      v_band := 'red'; v_cost := 3;
    END IF;

    INSERT INTO public.booking_slots (slot_time, band, points_cost, status)
    VALUES (v_slot_time, v_band, v_cost, 'free')
    ON CONFLICT (slot_time) DO NOTHING;

    -- .30 slot
    v_slot_time := make_timestamp(
      EXTRACT(YEAR FROM p_date)::INT,
      EXTRACT(MONTH FROM p_date)::INT,
      EXTRACT(DAY FROM p_date)::INT,
      v_hour, 30, 0
    );
    -- Band and cost remain the same for the .30 slot within the hour
    INSERT INTO public.booking_slots (slot_time, band, points_cost, status)
    VALUES (v_slot_time, v_band, v_cost, 'free')
    ON CONFLICT (slot_time) DO NOTHING;
  END LOOP;
END;
$$;

-- Example of how to call it for today:
-- SELECT public.populate_daily_slots(CURRENT_DATE);
-- SELECT public.populate_daily_slots(CURRENT_DATE + INTERVAL '1 day');
