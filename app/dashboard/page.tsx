import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "@/lib/actions"
import { getBookings, getUserBookings } from "@/lib/booking-actions"
import TimeSlotPicker from "@/components/dashboard/time-slot-picker"
import MyBookings from "@/components/dashboard/my-bookings"
import HeroSection from "@/components/dashboard/hero-section"
import { Toaster } from "sonner"
import WalletBar from "@/components/dashboard/wallet-bar"

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const today = new Date().toISOString().split("T")[0]
  const [todayBookings, userBookings] = await Promise.all([getBookings(today), getUserBookings()])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 text-foreground">
      <Toaster theme="dark" />

      <header className="border-b border-border/30 bg-black/90 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div
                className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-2 rounded-lg shadow-md border border-slate-300/50 flex items-center justify-center w-10 h-10"
                style={{
                  background:
                    "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
                }}
              >
                <span className="text-xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 tracking-tighter">
                  ICU
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300 tracking-tight">
                  Creative Studio{" "}
                  <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 drop-shadow-lg trap-text-glow">
                    1
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <WalletBar />
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Signed in: {user.email}</span>
                <form action={signOut}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="border-border/50 bg-black/50 text-secondary-foreground hover:bg-secondary/20 hover:text-foreground backdrop-blur-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <HeroSection />
          <TimeSlotPicker bookings={todayBookings} />
          <MyBookings bookings={userBookings} />
        </div>
      </main>

      <footer className="border-t border-border/20 py-10 mt-16 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Creative Studio 1. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
