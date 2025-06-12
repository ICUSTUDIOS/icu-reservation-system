import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserBookings, getAllBookings } from "@/lib/booking-actions"
import DashboardClientWrapper from "@/components/dashboard/dashboard-client-wrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Access & Reservation | ICU",
  description: "Book studio time and manage your reservations.",
}

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  const isAdmin = member && ['admin', 'super_admin'].includes(member.role)

  // Get all bookings for the time slot picker and user's bookings for the reservations section
  const [allBookings, userBookings, memberData] = await Promise.all([
    getAllBookings(), 
    getUserBookings(),
    supabase
      .from('members')
      .select('weekend_slots_used, weekend_slots_max')
      .eq('auth_id', user.id)
      .single()
  ])

  // Extract weekend slot info for the time slot picker
  const weekendSlotInfo = memberData.data ? {
    used: memberData.data.weekend_slots_used,
    max: memberData.data.weekend_slots_max
  } : { used: 0, max: 6 } // fallback

  return (
    <DashboardClientWrapper
      userEmail={user.email}
      isAdmin={isAdmin}
      allBookings={allBookings}
      userBookings={userBookings}
      weekendSlotInfo={weekendSlotInfo}
    />
  )
}
