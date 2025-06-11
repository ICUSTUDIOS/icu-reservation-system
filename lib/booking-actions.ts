"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { parseISO } from "date-fns"

export interface Booking {
  id: string
  member_id: string
  start_time: string
  end_time: string
  points_cost?: number
  slot_type?: string
  created_at: string
  updated_at: string
}

export async function createBooking(startTime: string, endTime: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to make a booking" }
  }

  try {
    // Use the new enhanced booking function with points system
    const { data, error } = await supabase.rpc("create_booking_with_points", {
      p_member_auth_id: user.id,
      p_start_time: startTime,
      p_end_time: endTime,
    })

    if (error) {
      console.error("Error creating booking:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: true, data: { id: data } }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Failed to create booking" }
  }
}

export async function getBookings(date: string) {
  const supabase = await createClient()

  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("start_time", startOfDay)
    .lte("end_time", endOfDay)
    .order("start_time")

  if (error) {
    console.error("Error fetching bookings:", error)
    return []
  }

  return data as Booking[]
}

export async function getUserBookings() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  // First get the member record using the auth user ID
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (memberError || !member) {
    console.error("Error fetching member:", memberError)
    return []
  }

  // Then get bookings using the member ID
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("member_id", member.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time")

  if (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }

  return data as Booking[]
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to cancel a booking" }
  }

  try {
    // Use the new enhanced cancellation function with refund system
    const { error } = await supabase.rpc("cancel_booking_with_refund", {
      p_member_auth_id: user.id,
      p_booking_id: bookingId,
    })

    if (error) {
      console.error("Error cancelling booking:", error)
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "Failed to cancel booking" }
  }
}
