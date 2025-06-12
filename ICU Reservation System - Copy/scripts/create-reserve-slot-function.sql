CREATE OR REPLACE FUNCTION public.reserve_slot(
  p_member_auth_id  UUID, -- Renamed for clarity, should be auth.users.id
  p_booking_slot_id UUID  -- Renamed for clarity, should be booking_slots.id
) RETURNS public.booking_slots -- Explicitly schema-qualify the return type
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_band       TEXT;
  v_slot_cost       INT;
  v_member_wallet   INT;
  v_member_red_week INT;
  v_selected_slot   public.booking_slots%ROWTYPE; -- To store the selected slot for returning
BEGIN
  -- Lock the specific slot and check its status
  SELECT *
  INTO   v_selected_slot
  FROM   public.booking_slots
  WHERE  id = p_booking_slot_id AND status = 'free'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not available or does not exist (ID: %)', p_booking_slot_id;
  END IF;

  v_slot_band := v_selected_slot.band;
  v_slot_cost := v_selected_slot.points_cost;

  -- Lock the member record
  SELECT wallet_points, red_points_week
  INTO   v_member_wallet, v_member_red_week
  FROM   public.members
  WHERE  auth_id = p_member_auth_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member record not found (Auth ID: %)', p_member_auth_id;
  END IF;

  -- Perform point checks
  -- General wallet check for ALL bands
  IF v_member_wallet < v_slot_cost THEN
    RAISE EXCEPTION 'Not enough points in wallet. Have: %, Need: %', v_member_wallet, v_slot_cost;
  END IF;

  -- Specific check for 'red' band slots against weekly red point cap
  IF v_slot_band = 'red' AND (v_member_red_week + v_slot_cost) > (SELECT red_cap_week FROM public.members WHERE auth_id = p_member_auth_id) THEN
    RAISE EXCEPTION 'Weekly red slot limit exceeded. Used: %, Attempting to use: %, Cap: %', v_member_red_week, v_slot_cost, (SELECT red_cap_week FROM public.members WHERE auth_id = p_member_auth_id);
  END IF;

  -- All checks passed, proceed with booking
  UPDATE public.booking_slots
  SET    member_id = p_member_auth_id,
         status = 'confirmed',
         updated_at = now()
  WHERE  id = p_booking_slot_id;

  -- Update member's points
  -- Deduct from general wallet for ALL slots
  -- Increment red_points_week only for 'red' slots
  UPDATE public.members
  SET    wallet_points   = wallet_points - v_slot_cost,
         red_points_week = red_points_week + CASE WHEN v_slot_band = 'red' THEN v_slot_cost ELSE 0 END,
         updated_at      = now()
  WHERE  auth_id = p_member_auth_id;

  -- Log the transaction in point_ledger
  INSERT INTO public.point_ledger (member_id, delta, reason, ref_booking_id)
  VALUES (p_member_auth_id, -v_slot_cost, 'reserve_slot', p_booking_slot_id);

  -- Refresh v_selected_slot with latest data after update
  SELECT * INTO v_selected_slot FROM public.booking_slots WHERE id = p_booking_slot_id;

  RETURN v_selected_slot;
END;
$$;
