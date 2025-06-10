"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button" // Main button component
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-3 text-base font-semibold rounded-md h-12 shadow-trap-glow hover:shadow-trap-glow-strong transition-all"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "SIGN IN"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard") // Redirect to the dashboard after login
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-black/80 backdrop-blur-sm border border-border/30 rounded-xl shadow-2xl shadow-black/50">
      <div className="space-y-3 text-center">
        <div className="flex justify-center mb-6">
          <div
            className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-3.5 rounded-lg shadow-md flex items-center justify-center border border-slate-300/50"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <span className="text-6xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 tracking-tighter drop-shadow-sm">
              ICU
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300">
          Creative Studio{" "}
          <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 drop-shadow-lg trap-text-glow">
            1
          </span>
        </h1>
        <p className="text-md text-muted-foreground">Access your creative space.</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-md text-sm">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-black/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary backdrop-blur-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-black/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary backdrop-blur-sm"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Dialog>
            <DialogTrigger className="font-medium text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-transparent border-none cursor-pointer p-0">
              Apply
            </DialogTrigger>
            <DialogContent className="bg-black/95 border-border/50 backdrop-blur-sm max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
                  Application Slots Full
                </DialogTitle>
                <DialogDescription className="text-foreground/80">
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
