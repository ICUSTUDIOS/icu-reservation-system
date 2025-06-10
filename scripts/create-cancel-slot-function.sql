CREATE OR REPLACE FUNCTION public.cancel_slot(
  p_member_auth_id  UUID, -- Renamed for clarity, should be auth.users.id
  p_booking_slot_id UUID  -- Renamed for clarity, should be booking_slots.id
) RETURNS public.booking_slots -- Explicitly schema-qualify the return type
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_band       TEXT;
  v_slot_cost       INT;
  v_refund_amount   INT;
  v_slot_start_time TIMESTAMPTZ;
  v_cancelled_slot  public.booking_slots%ROWTYPE;
BEGIN
  -- Lock the specific slot and check if it's booked by the member
  SELECT *
  INTO   v_cancelled_slot
  FROM   public.booking_slots
  WHERE  id = p_booking_slot_id AND member_id = p_member_auth_id AND status = 'confirmed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found for this member or slot is not confirmed (Slot ID: %, Member Auth ID: %)', p_booking_slot_id, p_member_auth_id;
  END IF;

  v_slot_band := v_cancelled_slot.band;
  v_slot_cost := v_cancelled_slot.points_cost;
  v_slot_start_time := v_cancelled_slot.slot_time; -- Corrected column name

  -- Calculate refund amount: 50% (rounded up) if cancellation is < 24 hours before start time
  IF v_slot_start_time - now() < interval '24 hours' THEN
    v_refund_amount := CEIL(v_slot_cost * 0.5)::INT;
  ELSE
    v_refund_amount := v_slot_cost;
  END IF;

  -- Update the slot to be free
  UPDATE public.booking_slots
  SET    member_id = NULL,
         status = 'free',
         updated_at = now()
  WHERE  id = p_booking_slot_id;

  -- Update member's points
  -- Wallet points are always refunded based on v_refund_amount
  -- Red points are adjusted if the cancelled slot was red
  UPDATE public.members
  SET    wallet_points   = wallet_points + v_refund_amount,
         red_points_week = red_points_week - CASE WHEN v_slot_band = 'red' THEN v_refund_amount ELSE 0 END,
         updated_at      = now()
  WHERE  auth_id = p_member_auth_id;

  -- Ensure red_points_week doesn't go negative (though logically it shouldn't if points were deducted correctly)
  UPDATE public.members
  SET red_points_week = GREATEST(0, red_points_week)
  WHERE auth_id = p_member_auth_id;

  -- Log the transaction in point_ledger
  INSERT INTO public.point_ledger (member_id, delta, reason, ref_booking_id)
  VALUES (p_member_auth_id, v_refund_amount, 'cancel_refund', p_booking_slot_id);

  -- Refresh v_cancelled_slot with latest data after update
  SELECT * INTO v_cancelled_slot FROM public.booking_slots WHERE id = p_booking_slot_id;

  RETURN v_cancelled_slot;
END;
$$;
