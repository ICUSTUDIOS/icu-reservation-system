"use client"

import { useEffect, useState, useRef } from "react" // Added useRef
import { getMyWalletAction, type WalletInfo } from "@/lib/points-actions"
import { supabase } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Wallet, Zap, AlertTriangle } from "lucide-react"
import type { RealtimeChannel } from "@supabase/supabase-js" // Import type for RealtimeChannel

export default function WalletBar() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null) // Ref to store the channel instance

  const MAX_WALLET_POINTS = 40
  const MAX_RED_POINTS_WEEK = 6

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
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-32">
          <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-muted/20 rounded"></div>
        </div>
        <div className="w-32">
          <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-muted/20 rounded"></div>
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

  const quietPct = wallet.wallet_points > 0 ? (wallet.wallet_points / MAX_WALLET_POINTS) * 100 : 0
  const redPct = wallet.red_points_week > 0 ? (wallet.red_points_week / MAX_RED_POINTS_WEEK) * 100 : 0

  return (
    <div className="flex items-center gap-x-6 p-3 rounded-lg border border-border/30 bg-black/50 backdrop-blur-sm shadow-lg shadow-black/30">
      <div className="w-40">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-foreground/80 flex items-center">
            <Wallet className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Monthly
          </span>
          <span className="font-semibold text-primary text-sm">
            {wallet.wallet_points}/{MAX_WALLET_POINTS}
          </span>
        </div>
        <Progress value={quietPct} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
        {wallet.wallet_points === 0 && <p className="text-[10px] text-amber-400 mt-1 leading-tight">Wallet empty.</p>}
      </div>

      <div className="w-40">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="font-medium text-foreground/80 flex items-center">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-red-500" />
            Red Zone
          </span>
          <span className="font-semibold text-red-400 text-sm">
            {wallet.red_points_week}/{MAX_RED_POINTS_WEEK}
          </span>
        </div>
        <Progress value={redPct} className="h-1.5 [&>div]:bg-red-500" />
        {wallet.red_points_week >= MAX_RED_POINTS_WEEK && (
          <p className="text-[10px] text-red-400 mt-1 leading-tight">Limit reached.</p>
        )}
      </div>
    </div>
  )
}
