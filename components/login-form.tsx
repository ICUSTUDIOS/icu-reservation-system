"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button" // Main button component
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/actions"

// Import necessary dialog components
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button
      type="submit"
      disabled={isPending}
      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-md h-10 sm:h-12 shadow-trap-glow hover:shadow-trap-glow-strong transition-all touch-manipulation"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          <span className="text-sm sm:text-base">Signing in...</span>
        </>
      ) : (
        <span className="text-sm sm:text-base">SIGN IN</span>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await signIn(null, formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8 p-4 sm:p-8 bg-black/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-2xl shadow-black/50">
      <div className="space-y-2 sm:space-y-3 text-center">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div
            className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-2.5 sm:p-3.5 rounded-lg shadow-md flex items-center justify-center border border-slate-300/50"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-4xl sm:text-6xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 tracking-tighter drop-shadow-sm">
              ICU
            </span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300">
          Creative Studio{" "}
          <span className="text-3xl sm:text-5xl font-black text-amber-500 drop-shadow-lg"
                style={{ 
                  textShadow: '0 0 12px rgba(245, 158, 11, 0.8), 0 0 24px rgba(245, 158, 11, 0.6), 0 0 36px rgba(245, 158, 11, 0.4)' 
                }}>
            1
          </span>
        </h1>
        <p className="text-sm sm:text-md text-muted-foreground">Access your creative space.</p>
      </div>

      <form action={handleSubmit} className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground/80">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-black/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary backdrop-blur-sm text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-foreground/80">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-black/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary backdrop-blur-sm text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
        </div>

        <SubmitButton isPending={isPending} />

        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Dialog>
            <DialogTrigger className="font-medium text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-transparent border-none cursor-pointer p-0 text-xs sm:text-sm">
              Apply
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-border/50 backdrop-blur-sm max-w-sm sm:max-w-md mx-3 sm:mx-0">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
                  Application Slots Full
                </DialogTitle>
                <DialogDescription className="text-foreground/80 text-sm sm:text-base">
                  All studio application slots are currently filled. Please check back next month for new openings.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </div>
  )
}
