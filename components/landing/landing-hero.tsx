"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function LandingHero() {  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
        // If user signs out, ensure we clear the state immediately
      if (_event === 'SIGNED_OUT') {
        setUser(null)
        // Clear any potential cached state
        if (typeof window !== 'undefined') {
          // Force a complete refresh to ensure clean state
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <section className="relative py-16 sm:py-28 md:py-40">
      <div className="absolute inset-0 bg-[url('/dark-abstract-studio.png')] bg-center bg-cover opacity-10 mix-blend-soft-light -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-background to-background -z-10"></div>

      <div className="max-w-4xl mx-auto text-center px-3 sm:px-4">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div
            className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-2.5 sm:p-3.5 rounded-lg shadow-md flex items-center justify-center border border-slate-300/50"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-5xl sm:text-6xl md:text-7xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 tracking-tighter drop-shadow-sm">
              ICU
            </span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400 mb-4 sm:mb-6 leading-tight">
          Your Private Studio, For ⅓ the Price.
        </h1>
        <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground mb-6 sm:mb-8 md:mb-10 leading-relaxed">
          Escape the expense of hourly rentals. Join a vetted community of creators and enjoy exclusive access to a
          professional studio, managed by a fair, point-based system that makes sharing simple and equitable.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          {loading ? (
            <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto" disabled>
              Loading...
            </Button>
          ) : user ? (
            <Button
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-gradient-to-r from-primary to-accent w-full sm:w-auto"
              asChild
            >
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto" asChild>
                <Link href="/apply">
                  Apply <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg bg-black/50 border-border/50 backdrop-blur-sm w-full sm:w-auto"
                asChild
              >
                <Link href="/auth/login">
                  Access <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
