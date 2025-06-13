"use client"

import { useEffect, useState, useRef } from "react" // Added useRef
import { getMyWalletAction, type WalletInfo } from "@/lib/points-actions"
import { supabase } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Wallet, Zap, AlertTriangle, HelpCircle, Calendar, Clock, RefreshCw } from "lucide-react"
import type { RealtimeChannel } from "@supabase/supabase-js" // Import type for RealtimeChannel

export default function WalletBar() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [previousPoints, setPreviousPoints] = useState<number | null>(null)
  const [pointsChanging, setPointsChanging] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null) // Ref to store the channel instance

  // Manual refresh function
  const refreshWallet = async () => {
    console.log("🔄 Manually refreshing wallet...")
    setRefreshing(true)
    try {
      const updatedWallet = await getMyWalletAction()
      if (updatedWallet.data) {
        setWallet(prevWallet => {
          // Animate points change if there's a difference
          if (prevWallet && updatedWallet.data && updatedWallet.data.monthly_points !== prevWallet.monthly_points) {
            const pointsDiff = updatedWallet.data.monthly_points - prevWallet.monthly_points
            setPreviousPoints(prevWallet.monthly_points)
            setPointsChanging(true)
            setTimeout(() => setPointsChanging(false), 1500)
            
            // Visual feedback through bar animations only (no toast notifications)
            console.log(`✨ Manual refresh animation triggered: ${Math.abs(pointsDiff)} points ${pointsDiff > 0 ? 'refunded' : 'used'}`)
          }
          return updatedWallet.data || prevWallet
        })
      }
    } catch (error) {
      console.error("Error refreshing wallet:", error)
    }
    setRefreshing(false)
  }

  useEffect(() => {
    let mounted = true
    let retryTimeoutId: NodeJS.Timeout | null = null

    // Set mounted state for hydration safety
    setMounted(true)

    async function fetchInitialWallet() {
      if (!mounted) return
      setLoading(true)
      try {
        const initialWallet = await getMyWalletAction()
        if (!mounted) return
        
        if (initialWallet.error) {
          console.error("Failed to load wallet:", initialWallet.error)
          setWallet(null)
        } else {
          setWallet(initialWallet.data || null)
        }
      } catch (error) {
        console.error("Error fetching initial wallet:", error)
        if (mounted) setWallet(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Listen for manual wallet refresh events
    const handleWalletRefresh = () => {
      if (mounted) {
        console.log("🔔 Received wallet refresh event")
        refreshWallet()
      }
    }
    
    const setupRealtimeSubscription = () => {
      if (!mounted || channelRef.current) return

      try {
        const channelName = `wallet-updates-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        channelRef.current = supabase
          .channel(channelName, {
            config: {
              presence: { key: 'wallet-presence' },
              broadcast: { self: false },
            }
          })
          .on("postgres_changes", { 
            event: "*", 
            schema: "public", 
            table: "members" 
          }, async (payload) => {
            if (!mounted) return
            console.log("📊 Member data changed, refreshing wallet:", payload)
            try {
              const updatedWallet = await getMyWalletAction()
              if (!mounted || !updatedWallet.data) return
              
              setWallet(prevWallet => {
                if (!prevWallet || !updatedWallet.data) return updatedWallet.data || prevWallet
                
                if (updatedWallet.data.monthly_points !== prevWallet.monthly_points) {
                  const pointsDiff = updatedWallet.data.monthly_points - prevWallet.monthly_points
                  console.log(`💰 Points changed: ${prevWallet.monthly_points} → ${updatedWallet.data.monthly_points} (${pointsDiff > 0 ? '+' : ''}${pointsDiff})`)
                  setPreviousPoints(prevWallet.monthly_points)
                  setPointsChanging(true)
                  setTimeout(() => {
                    if (mounted) setPointsChanging(false)
                  }, 1500)
                }
                return updatedWallet.data
              })
            } catch (error) {
              console.error("Error handling member data change:", error)
            }
          })
          .on("postgres_changes", { 
            event: "INSERT", 
            schema: "public", 
            table: "points_transactions" 
          }, async (payload) => {
            if (!mounted) return
            console.log("💳 Points transaction created, refreshing wallet:", payload)
            await refreshWallet()
          })
          .on("postgres_changes", { 
            event: "*", 
            schema: "public", 
            table: "bookings" 
          }, async (payload) => {
            if (!mounted) return
            console.log("📅 Booking change detected, refreshing wallet:", payload)
            await refreshWallet()
          })
          .subscribe((status, err) => {
            if (!mounted) return
            
            console.log("Wallet subscription status:", status, err)
            if (status === "SUBSCRIBED") {
              console.log("✅ Subscribed to wallet updates!")
            } else if (status === "CHANNEL_ERROR") {
              console.error("❌ Wallet subscription error:", err)
              // Retry connection after delay
              if (retryTimeoutId) clearTimeout(retryTimeoutId)
              retryTimeoutId = setTimeout(() => {
                if (mounted && channelRef.current) {
                  console.log("🔄 Retrying wallet subscription...")
                  supabase.removeChannel(channelRef.current)
                  channelRef.current = null
                  setupRealtimeSubscription()
                }
              }, 5000)
            } else if (status === "TIMED_OUT") {
              console.warn("⏰ Wallet subscription timed out - will retry")
              if (retryTimeoutId) clearTimeout(retryTimeoutId)
              retryTimeoutId = setTimeout(() => {
                if (mounted) setupRealtimeSubscription()
              }, 3000)
            } else if (status === "CLOSED") {
              console.log("🔌 Wallet subscription closed")
              channelRef.current = null
            }
          })
      } catch (error) {
        console.error("Error setting up realtime subscription:", error)
      }
    }

    fetchInitialWallet()
    window.addEventListener('wallet-refresh-needed', handleWalletRefresh)
    setupRealtimeSubscription()

    // Cleanup function
    return () => {
      mounted = false
      
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId)
      }
      
      window.removeEventListener('wallet-refresh-needed', handleWalletRefresh)
      
      if (channelRef.current) {
        console.log("🧹 Cleaning up wallet subscription...")
        supabase
          .removeChannel(channelRef.current)
          .then(() => console.log("✅ Successfully removed wallet channel"))
          .catch((err) => console.error("❌ Error removing wallet channel:", err))
        channelRef.current = null
      }
    }
  }, [])

  if (loading || !mounted) {
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
      <div className="flex items-center gap-1 lg:gap-1.5 px-2 py-1 lg:px-2 lg:py-1 rounded-full bg-black/90 backdrop-blur-sm border border-white/5 relative"
           style={{
             boxShadow: `
               inset 0 4px 8px rgba(0,0,0,0.9),
               inset 0 2px 4px rgba(0,0,0,0.8),
               inset 0 1px 2px rgba(0,0,0,0.7),
               0 1px 2px rgba(255,255,255,0.1)
             `,
             overflow: 'visible'
           }}>
        
        {/* Manual Refresh Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshWallet}
              disabled={refreshing}
              className="h-6 w-6 lg:h-6 lg:w-6 p-0 hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
            >
              <RefreshCw className={`h-3 w-3 lg:h-3 lg:w-3 text-foreground hover:text-accent transition-colors ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Refresh wallet</p>
          </TooltipContent>
        </Tooltip>

        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-1 lg:gap-1 cursor-pointer hover:bg-white/10 px-1.5 lg:px-1.5 py-1 lg:py-1 rounded-full transition-all duration-200 group relative" style={{ overflow: 'visible' }}>
              <Wallet className="h-4 w-4 lg:h-4 lg:w-4 text-primary group-hover:text-accent transition-colors flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1 relative" style={{ overflow: 'visible' }}>
                <div className="flex items-center gap-1 mb-1 lg:mb-0.5 relative" style={{ overflow: 'visible' }}>
                  <span className="text-sm lg:text-xs font-bold lg:font-medium text-foreground/90 whitespace-nowrap">Points</span>
                  <div className="relative overflow-visible">
                    <span className={`text-sm lg:text-xs font-bold transition-all duration-500 ${
                      pointsChanging ? 'transform scale-110' : ''
                    } ${
                      wallet.monthly_points <= 5 ? 'text-red-400' : 
                      wallet.monthly_points <= 15 ? 'text-yellow-400' : 
                      'text-primary'
                    }`}>
                      {wallet.monthly_points}
                    </span>
                  </div>
                  <span className="text-sm lg:text-xs text-foreground/60">/{wallet.monthly_points_max}</span>
                </div>
                <div className={`relative w-24 lg:w-20 h-2 lg:h-1.5 bg-black/50 rounded-full border border-white/20 overflow-hidden transition-all duration-300 ${
                  pointsChanging ? 'ring-2 ring-primary/50 ring-opacity-75 animate-pulse' : ''
                }`}>
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                      wallet.monthly_points <= 5 
                        ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                        : wallet.monthly_points <= 15 
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                        : 'bg-gradient-to-r from-primary to-accent shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                    } ${pointsChanging ? 'animate-pulse' : ''}`}
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
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-semibold text-amber-400 mb-1">Weekend Booking Rules:</p>
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
            <div className="flex items-center gap-1 lg:gap-1 cursor-pointer hover:bg-white/10 px-1.5 lg:px-1.5 py-1 lg:py-1 rounded-full transition-all duration-200 group">
              <Calendar className="h-4 w-4 lg:h-4 lg:w-4 text-orange-500 group-hover:text-orange-400 transition-colors flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-1 lg:mb-0.5">
                  <span className="text-sm lg:text-xs font-bold lg:font-medium text-foreground/90 whitespace-nowrap">Weekend Slots</span>
                  <span className={`text-sm lg:text-xs font-bold ${
                    weekendSlotsRemaining === 0 ? 'text-red-400' : 
                    weekendSlotsRemaining <= 2 ? 'text-yellow-400' : 
                    'text-orange-400'
                  }`}>{weekendSlotsRemaining}</span>
                  <span className="text-sm lg:text-xs text-foreground/60">/{wallet.weekend_slots_max}</span>
                </div>
                <div className="relative w-20 lg:w-18 h-2 lg:h-1.5 bg-black/50 rounded-full border border-white/20 overflow-hidden">
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
                  <p className="text-foreground/80 text-xs bg-amber-500/20 border border-amber-400/50 rounded p-2">
                    <strong>Remember:</strong> Each weekend slot costs 3 points from your main wallet. Maximum 3 hours (6 slots) per weekend = 18 points total.
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
                      <li>• You can only make <strong>6 weekend bookings</strong> per week maximum (3 hours total)</li>
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
                  <span className="font-bold text-orange-400">6 available slots</span> next Monday at midnight.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
