"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Type for the expected return data from the RPC calls (booking_slots row)
// You might want to refine this based on the actual structure of booking_slots
export interface BookingSlot {
  id: string
  slot_time: string
  band: string
  points_cost: number
  status: string
  member_id: string | null
  created_at: string
  updated_at: string
}

export interface WalletInfo {
  wallet_points: number
  red_points_week: number
}

export async function reserveSlotAction(bookingSlotId: string): Promise<{ data?: BookingSlot; error?: string }> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated." }
  }

  const { data, error: rpcError } = await supabase.rpc("reserve_slot", {
    p_member_auth_id: user.id, // Ensure this matches your DB function parameter
    p_booking_slot_id: bookingSlotId, // Ensure this matches your DB function parameter
  })

  if (rpcError) {
    console.error("Error reserving slot:", rpcError)
    return { error: rpcError.message }
  }

  revalidatePath("/") // Revalidate relevant paths to update UI
  return { data: data as BookingSlot }
}

export async function cancelSlotAction(bookingSlotId: string): Promise<{ data?: BookingSlot; error?: string }> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated." }
  }

  const { data, error: rpcError } = await supabase.rpc("cancel_slot", {
    p_member_auth_id: user.id, // Ensure this matches your DB function parameter
    p_booking_slot_id: bookingSlotId, // Ensure this matches your DB function parameter
  })

  if (rpcError) {
    console.error("Error cancelling slot:", rpcError)
    return { error: rpcError.message }
  }

  revalidatePath("/") // Revalidate relevant paths to update UI
  return { data: data as BookingSlot }
}

export async function getMyWalletAction(): Promise<{ data?: WalletInfo; error?: string }> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const {
    data: { user }, // We need the user context for RLS on 'members' table
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "User not authenticated." }
  }

  const { data, error: dbError } = await supabase
    .from("members")
    .select("wallet_points, red_points_week")
    .eq("auth_id", user.id) // RLS will also enforce this, but explicit is good
    .single()

  if (dbError) {
    console.error("Error fetching wallet info:", dbError)
    return { error: dbError.message }
  }

  return { data }
}
