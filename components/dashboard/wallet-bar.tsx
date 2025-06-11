"use client"

import { useEffect, useState, useRef } from "react" // Added useRef
import { getMyWalletAction, type WalletInfo } from "@/lib/points-actions"
import { supabase } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Wallet, Zap, AlertTriangle, HelpCircle, Calendar, Clock } from "lucide-react"
import type { RealtimeChannel } from "@supabase/supabase-js" // Import type for RealtimeChannel

export default function WalletBar() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null) // Ref to store the channel instance

  useEffect(() => {
    async function fetchInitialWallet() {
      setLoading(true)
      const initialWallet = await getMyWalletAction()
      if (initialWallet.error) {
        toast.error(`Failed to load wallet: ${initialWallet.error}`)
        setWallet(null)
      } else {
        setWallet(initialWallet.data || null)
      }
      setLoading(false)
    }

    fetchInitialWallet()

    // Ensure channel is only created and subscribed once
    if (!channelRef.current) {
      channelRef.current = supabase
        .channel("wallet-updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "members" }, async (payload) => {
          console.log("Member data changed, refreshing wallet:", payload)
          const updatedWallet = await getMyWalletAction()
          if (updatedWallet.data) {
            setWallet(updatedWallet.data)
          }
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "point_ledger" }, async (payload) => {
          console.log("Point ledger updated, refreshing wallet:", payload)
          const updatedWallet = await getMyWalletAction()
          if (updatedWallet.data) {
            setWallet(updatedWallet.data)
          }
        })
        // .subscribe() is called only once after all .on() listeners are attached
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to wallet updates!")
          } else if (status === "CHANNEL_ERROR") {
            console.error("Subscription Error:", err)
            toast.error("Real-time wallet update failed.")
          } else if (status === "TIMED_OUT") {
            console.warn("Subscription timed out.")
          } else if (status === "CLOSED") {
            console.log("Subscription closed.")
          }
        })
    }

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase
          .removeChannel(channelRef.current)
          .then(() => console.log("Successfully removed channel"))
          .catch((err) => console.error("Error removing channel:", err))
        channelRef.current = null // Reset ref after removing
      }
    }
  }, []) // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-24">
          <div className="h-3 bg-muted/30 rounded w-3/4 mb-1"></div>
          <div className="h-1.5 bg-muted/20 rounded"></div>
        </div>
        <div className="w-24">
          <div className="h-3 bg-muted/30 rounded w-3/4 mb-1"></div>
          <div className="h-1.5 bg-muted/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-xs text-center">
        <AlertTriangle className="mx-auto h-5 w-5 text-destructive mb-1" />
        <p className="text-destructive-foreground">Wallet Error</p>
      </div>
    )
  }

  const monthlyPct = wallet.monthly_points > 0 ? (wallet.monthly_points / wallet.monthly_points_max) * 100 : 0
  const weekendSlotsRemaining = wallet.weekend_slots_max - wallet.weekend_slots_used
  const weekendPct = weekendSlotsRemaining > 0 ? (weekendSlotsRemaining / wallet.weekend_slots_max) * 100 : 0

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-sm border border-white/5"
           style={{
             boxShadow: `
               inset 0 4px 8px rgba(0,0,0,0.9),
               inset 0 2px 4px rgba(0,0,0,0.8),
               inset 0 1px 2px rgba(0,0,0,0.7),
               0 1px 2px rgba(255,255,255,0.1)
             `
           }}>
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-full transition-all duration-200 group">
              <Wallet className="h-4 w-4 text-primary group-hover:text-accent transition-colors" />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-medium text-foreground/90">Points</span>
                  <span className={`text-sm font-bold ${
                    wallet.monthly_points <= 5 ? 'text-red-400' : 
                    wallet.monthly_points <= 15 ? 'text-yellow-400' : 
                    'text-primary'
                  }`}>{wallet.monthly_points}</span>
                  <span className="text-sm text-foreground/60">/{wallet.monthly_points_max}</span>
                </div>
                <div className="relative w-24 h-2 bg-black/50 rounded-full border border-white/20 overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                      wallet.monthly_points <= 5 
                        ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                        : wallet.monthly_points <= 15 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                        : 'bg-gradient-to-r from-primary to-accent shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                    }`}
                    style={{ width: `${monthlyPct}%` }}
                  />
                  {/* Background pattern for empty portion */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-white/5 opacity-30" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-background/95 border-border backdrop-blur-sm max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground mb-4">
                Your Points Wallet
              </DialogTitle>
              <DialogDescription className="text-foreground/80">
                Your single 40-point wallet for ALL reservations (weekday and weekend). Points reset monthly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-foreground">
                    <span className="font-semibold">Points Available:</span>{" "}
                    <span className="font-bold text-primary">{wallet.monthly_points}</span> out of {wallet.monthly_points_max}
                  </p>
                  <p className="text-foreground/80 text-sm">
                    1 point = 30 minutes of studio time. Use for any booking (weekday or weekend).
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground">Monthly Allowance</span>
                  <span className="font-bold text-primary text-lg">{wallet.monthly_points_max} points</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-foreground">Points Used</span>
                  <span className="font-bold text-foreground">
                    {wallet.monthly_points_max - wallet.monthly_points} points ({(((wallet.monthly_points_max - wallet.monthly_points) / wallet.monthly_points_max) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="text-sm text-foreground/80 space-y-1">
                  <p><strong>Weekday Rate:</strong> 1 point per 30 minutes (Mon-Thu 9am-5pm, Fri 9am-5pm)</p>
                  <p><strong>Evening Rate:</strong> 2 points per 30 minutes (Mon-Thu 5pm-9pm)</p>
                  <p><strong>Weekend Rate:</strong> 3 points per 30 minutes (Fri 5pm+, Sat-Sun)</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-semibold text-amber-400 mb-2">Weekend Booking Rules:</p>
                    <ul className="text-foreground/90 text-sm space-y-1">
                      <li>• Weekday bookings cost <strong>1 point each</strong> from this wallet</li>
                      <li>• Evening bookings cost <strong>2 points each</strong> from this wallet</li>
                      <li>• Weekend bookings cost <strong>3 points each</strong> from this wallet</li>
                      <li>• You also have a separate <strong>weekly limit</strong> of {wallet.weekend_slots_max} weekend bookings</li>
                      <li>• The weekend limit is NOT extra points - it's just a fairness rule</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-accent/10 border border-accent/30 rounded-lg p-4">
                <Calendar className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-foreground">
                  <span className="font-semibold text-accent">Next Reset:</span> Your points will be restored to{" "}
                  <span className="font-bold text-primary">{wallet.monthly_points_max}</span> on the 1st of next month.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-full transition-all duration-200 group">
              <Calendar className="h-4 w-4 text-orange-500 group-hover:text-orange-400 transition-colors" />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium text-foreground/90">Weekend Limit</span>
                  <span className={`text-xs font-bold ${
                    weekendSlotsRemaining === 0 ? 'text-red-400' : 
                    weekendSlotsRemaining <= 2 ? 'text-yellow-400' : 
                    'text-orange-400'
                  }`}>{weekendSlotsRemaining}</span>
                  <span className="text-xs text-foreground/60">/{wallet.weekend_slots_max} left</span>
                </div>
                <div className="relative w-20 h-1.5 bg-black/50 rounded-full border border-white/20 overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                      weekendSlotsRemaining === 0 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_6px_rgba(239,68,68,0.6)]' 
                        : weekendSlotsRemaining <= 2 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.6)]'
                    }`}
                    style={{ width: `${weekendPct}%` }}
                  />
                  {/* Background pattern for used portion */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-white/5 opacity-20" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="bg-background/95 border-border backdrop-blur-sm max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground mb-4">
                Weekend Booking Limit
              </DialogTitle>
              <DialogDescription className="text-foreground/80">
                This is NOT extra points - it's a separate weekly limit for weekend bookings to ensure fair access.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-left">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-semibold text-amber-400 mb-1">Important: This is NOT extra points!</p>
                    <p className="text-foreground/90 text-sm">
                      Weekend bookings still cost points from your main wallet (3 points per 30-minute slot). 
                      This counter just limits how many weekend slots you can book per week.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-foreground">
                    <span className="font-semibold text-orange-400">Weekend Slots Available:</span>{" "}
                    <span className="font-bold text-green-400">{weekendSlotsRemaining}</span> out of {wallet.weekend_slots_max}
                  </p>
                  <p className="text-foreground/80 text-sm">
                    Weekend times: Friday 5pm onwards + all day Saturday & Sunday.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pl-8 border-l-2 border-orange-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">
                    <span className="font-medium text-orange-400">Slots Used This Week:</span>{" "}
                    <span className="font-bold text-orange-500">{wallet.weekend_slots_used}</span> / {wallet.weekend_slots_max}
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <p className="text-foreground">
                    <span className="font-medium text-green-400">Remaining:</span>{" "}
                    <span className="font-bold text-green-500">{weekendSlotsRemaining}</span> weekend slots available
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-semibold text-blue-400 mb-2">How It Works:</p>
                    <ul className="text-foreground/90 text-sm space-y-1">
                      <li>• Weekend bookings cost <strong>3 points each</strong> from your main wallet</li>
                      <li>• You can only make <strong>{wallet.weekend_slots_max} weekend bookings</strong> per week maximum</li>
                      <li>• This prevents anyone from using all weekend slots</li>
                      <li>• Your weekend limit resets every Monday</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-accent/10 border border-accent/30 rounded-lg p-4">
                <Clock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-foreground">
                  <span className="font-semibold text-accent">Next Reset:</span> Your weekend limit resets to{" "}
                  <span className="font-bold text-orange-400">{wallet.weekend_slots_max} available slots</span> next Monday at midnight.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
