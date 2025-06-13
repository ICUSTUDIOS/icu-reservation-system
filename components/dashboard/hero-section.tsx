"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Calendar, AlertTriangle, MessageCircle } from "lucide-react"

export default function HeroSection() {
  const [pointSystemOpen, setPointSystemOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering dialog until mounted
  if (!mounted) {
    return (
      <div className="text-center relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl overflow-hidden border border-border/20 bg-black/60 shadow-2xl shadow-black/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-30 z-0"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-center bg-cover mix-blend-soft-light opacity-5 z-0"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-300 mb-3 sm:mb-5 tracking-tight leading-tight">
            RESERVE YOUR TIME
          </h2>
          <div className="h-1.5 sm:h-2 w-16 sm:w-24 bg-gradient-to-r from-primary to-accent mx-auto mb-4 sm:mb-8 rounded-full shadow-trap-glow"></div>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Pick your date and time slot to reserve your session. Please note: late cancellations may result in losing
            half your points.{" "}
            <span className="text-primary hover:text-accent underline font-bold transition-colors cursor-pointer">
              View how point system works
            </span>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 rounded-xl sm:rounded-2xl overflow-hidden border border-border/20 bg-black/60 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-30 z-0"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-center bg-cover mix-blend-soft-light opacity-5 z-0"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* RESERVE YOUR TIME Section */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-300 mb-3 sm:mb-5 tracking-tight leading-tight">
          RESERVE YOUR TIME
        </h2>
        <div className="h-1.5 sm:h-2 w-16 sm:w-24 bg-gradient-to-r from-primary to-accent mx-auto mb-4 sm:mb-8 rounded-full shadow-trap-glow"></div>

        <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Pick your date and time slot to reserve your session. Please note: late cancellations may result in losing
          half your points.{" "}
          <a
            href="#"
            className="text-primary hover:text-accent underline font-bold transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              setPointSystemOpen(true)
            }}
          >
            View how point system works
          </a>
          .
        </p>
      </div>

      <Dialog open={pointSystemOpen} onOpenChange={setPointSystemOpen}>
        <DialogContent className="bg-black/95 border-border/50 backdrop-blur-sm max-w-2xl mx-3">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-3 sm:mb-4">
              How Your One-Wallet Points System Works
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 text-left max-h-96 overflow-y-auto">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold">Each point = 30 minutes of studio time</span> from your single wallet.
              </p>
            </div>

            <div className="space-y-3 pl-8 border-l-2 border-primary/30">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <span className="font-medium text-blue-400">Weekday Daytime (Mon-Thu 9am-5pm, Fri 9am-5pm)</span> cost{" "}
                  <span className="font-bold text-primary">1 point</span> per 30-minute slot.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <span className="font-medium text-yellow-400">Weekday Evenings (Mon-Thu 5pm-9pm)</span> cost{" "}
                  <span className="font-bold text-primary">2 points</span> per 30-minute slot.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <span className="font-medium text-orange-400">Weekend slots (Fri 5pm+, Sat-Sun)</span> cost{" "}
                  <span className="font-bold text-primary">3 points</span> per 30-minute slot.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-foreground">
                You get <span className="font-bold text-primary">40 points</span> every month—enough for{" "}
                <span className="font-semibold">20 hours</span> of weekday daytime.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-semibold text-amber-400 mb-1">Weekend Limit (Not Extra Points!):</p>
                  <p className="text-foreground/90 text-sm">
                    You can book maximum <span className="font-bold text-orange-400">12 weekend slots</span> per week for fairness (6 hours total). 
                    Weekend bookings still use points from your main wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold text-accent">Reset Schedule:</span> Points refresh monthly (1st), 
                weekend limit resets weekly (Monday).
              </p>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold text-yellow-400">Cancellation Policy:</span> Cancel{" "}
                <span className="font-semibold text-green-400">≥ 24h ahead</span> for 100% refund;{" "}
                <span className="font-semibold text-yellow-400">&lt; 24h</span> gets{" "}
                <span className="font-bold">50% refund</span>.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-accent/10 border border-accent/30 rounded-lg p-4">
              <MessageCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold">Need help?</span> Contact{" "}
                <span className="font-bold text-accent">kzhtin</span> via private group.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
