'use client'

import { LogOut, Shield } from "lucide-react"
import ClientSignOutButton from "@/components/client-signout-button"
import TimeSlotPicker from "@/components/dashboard/time-slot-picker"
import MyBookings from "@/components/dashboard/my-bookings-simple"
import HeroSection from "@/components/dashboard/hero-section"
import ActionButtons from "@/components/dashboard/action-buttons"
import { Toaster } from "sonner"
import WalletBar from "@/components/dashboard/wallet-bar"
import Link from "next/link"

interface DashboardClientWrapperProps {
  userEmail: string
  isAdmin: boolean
  allBookings: any[]
  userBookings: any[]
  weekendSlotInfo: { used: number; max: number }
}

export default function DashboardClientWrapper({ 
  userEmail, 
  isAdmin, 
  allBookings, 
  userBookings, 
  weekendSlotInfo 
}: DashboardClientWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 text-foreground">
      <Toaster theme="dark" />

      <header className="border-b border-border/30 backdrop-blur-md sticky top-0 z-50 relative"
              style={{
                background: 'linear-gradient(180deg, rgba(15,15,15,0.98) 0%, rgba(8,8,8,0.96) 50%, rgba(5,5,5,0.98) 100%)',
                boxShadow: `
                  inset 0 2px 4px rgba(0,0,0,0.6),
                  inset 0 1px 2px rgba(0,0,0,0.8)
                `
              }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
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
                  <span className="text-3xl font-black text-amber-500 drop-shadow-lg"
                        style={{ 
                          textShadow: '0 0 12px rgba(245, 158, 11, 0.8), 0 0 24px rgba(245, 158, 11, 0.6), 0 0 36px rgba(245, 158, 11, 0.4)' 
                        }}>
                    1
                  </span>
                </h1>
              </div>
            </div>

            {/* Center - Wallet Bar */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <WalletBar />
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm text-muted-foreground hidden sm:block">Signed in: {userEmail}</span>
              <ClientSignOutButton 
                variant="outline"
                size="sm"
                className="border-border/50 bg-black/50 text-secondary-foreground hover:bg-secondary/20 hover:text-foreground backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </ClientSignOutButton>
            </div>
          </div>
        </div>

        {/* Admin Panel Arrow */}
        {isAdmin && (
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 group cursor-pointer z-10"
            style={{ top: '100%', marginTop: '-1px' }}
          >
            <div className="relative">
              <div 
                className="w-28 h-8 bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 shadow-lg border border-amber-300/50 transition-all duration-300 group-hover:h-10 group-hover:shadow-xl flex items-center justify-center relative"
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 60%, 50% 100%, 0% 60%)',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Shield className="h-5 w-5 text-black transition-all duration-300 group-hover:h-6 group-hover:w-6" strokeWidth={2.2} />
                </div>
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                  style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 60%, 50% 100%, 0% 60%)' }}
                />
              </div>
              
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <Link href="/admin">
                  <div 
                    className="w-28 h-8 bg-gradient-to-t from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 border border-amber-300/50 flex items-center justify-center relative cursor-pointer"
                    style={{
                      clipPath: 'polygon(25% 100%, 75% 100%, 100% 40%, 50% 0%, 0% 40%)',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <span className="text-xs font-semibold text-black">Admin Panel</span>
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                      style={{ clipPath: 'polygon(25% 100%, 75% 100%, 100% 40%, 50% 0%, 0% 40%)' }}
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">        <div className="space-y-12">
          <ActionButtons />          <HeroSection />
          <TimeSlotPicker bookings={allBookings} weekendSlots={weekendSlotInfo} />
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
