import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserBookings, getAllBookings } from "@/lib/booking-actions"
import MobileOptimizedDashboard from "@/components/dashboard/mobile-optimized-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | ICU Creative Studio",
  description: "Book studio time and manage your reservations.",
}

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Connect Supabase to get started</h1>
          <p className="text-zinc-400">Please configure your Supabase environment variables</p>
        </div>
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

  // Get comprehensive member data
  const { data: member } = await supabase
    .from('members')
    .select('role, weekend_slots_used, weekend_slots_max, monthly_points, monthly_points_max')
    .eq('auth_id', user.id)
    .single()

  const isAdmin = member && ['admin', 'super_admin'].includes(member.role)

  // Get user's bookings
  const userBookings = await getUserBookings()

  return (
    <MobileOptimizedDashboard
      userId={user.id}
      userEmail={user.email || ''}
      isAdmin={isAdmin}
      initialBookings={userBookings || []}
      weekendSlotsUsed={member?.weekend_slots_used || 0}
    />
  )
}
