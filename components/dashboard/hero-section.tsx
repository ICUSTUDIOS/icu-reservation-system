"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Calendar, AlertTriangle, MessageCircle } from "lucide-react"

export default function HeroSection() {
  const [open, setOpen] = useState(false)

  return (
    <div className="text-center relative py-16 px-6 rounded-2xl overflow-hidden border border-border/20 bg-black/60 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-30 z-0"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-center bg-cover mix-blend-soft-light opacity-5 z-0"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-200 to-amber-300 mb-5 tracking-tight trap-text-glow">
          RESERVE YOUR TIME
        </h2>
        <div className="h-2 w-24 bg-gradient-to-r from-primary to-accent mx-auto mb-8 rounded-full shadow-trap-glow"></div>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
          Pick your date and time slot to reserve your session. Please note: late cancellations may result in losing
          half your points.{" "}
          <a
            href="#"
            className="text-primary hover:text-accent underline font-bold transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              setOpen(true)
            }}
          >
            View how point system works
          </a>
          .
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/95 border-border/50 backdrop-blur-sm max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
              How Your 40-Point Wallet Works
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold">Each point = 30 min.</span>
              </p>
            </div>

            <div className="space-y-3 pl-8 border-l-2 border-primary/30">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <span className="font-medium text-green-400">Weekdays (Mon-Thu) daytime</span> cost{" "}
                  <span className="font-bold text-primary">1 pt</span> per slot.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <span className="font-medium text-yellow-400">Weekday evenings & Fri daytime</span> cost{" "}
                  <span className="font-bold text-primary">2 pts</span>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                <p className="text-foreground">
                  <span className="font-medium text-red-400">Fri night + all weekend slots</span> cost{" "}
                  <span className="font-bold text-primary">3 pts</span>.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-foreground">
                You start every month with <span className="font-bold text-primary">40 pts</span>—enough for{" "}
                <span className="font-semibold">20 hours</span> in quiet times.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold text-red-400">Weekends are limited:</span> you can spend up to{" "}
                <span className="font-bold text-red-400">3 hours</span> in red times per week so everyone gets a fair
                shot.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                Cancel <span className="font-semibold text-green-400">≥ 24 h ahead</span> to get all points back;{" "}
                <span className="font-semibold text-yellow-400">late cancellations</span> refund{" "}
                <span className="font-bold">50%</span>.
              </p>
            </div>

            <div className="flex items-start gap-3 bg-accent/10 border border-accent/30 rounded-lg p-4">
              <MessageCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-foreground">
                <span className="font-semibold">Run out?</span> Contact{" "}
                <span className="font-bold text-accent">kzhtin</span> via private group.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
