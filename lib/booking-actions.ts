"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { parseISO } from "date-fns"

export interface Booking {
  id: string
  user_id: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export async function createBooking(startTime: string, endTime: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "You must be logged in to make a booking" }
  }

  // Validate times
  const startDate = parseISO(startTime)
  const endDate = parseISO(endTime)

  if (startDate >= endDate) {
    return { error: "End time must be after start time" }
  }

  // Check for conflicts
  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("*")
    .or(
      `and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime}),and(start_time.gte.${startTime},end_time.lte.${endTime})`,
    )

  if (conflictError) {
    return { error: "Error checking availability" }
  }

  if (conflicts && conflicts.length > 0) {
    return { error: "This time slot is already booked" }
  }

  // Create the booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single()

  if (error) {
    return { error: "Failed to create booking" }
  }

  revalidatePath("/")
  return { success: true, data }
}

export async function getBookings(date: string) {
  const supabase = createClient()

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
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time")

  if (error) {
    console.error("Error fetching user bookings:", error)
    return []
  }

  return data as Booking[]
}

export async function cancelBooking(bookingId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("bookings").delete().eq("id", bookingId)

  if (error) {
    return { error: "Failed to cancel booking" }
  }

  revalidatePath("/")
  return { success: true }
}
