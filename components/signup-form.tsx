"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Palette } from "lucide-react" // Changed icon
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-md h-10 sm:h-12 shadow-md hover:shadow-lg transition-all touch-manipulation"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          <span className="text-sm sm:text-base">Signing up...</span>
        </>
      ) : (
        <span className="text-sm sm:text-base">CREATE ACCOUNT</span>
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="w-full max-w-md space-y-6 sm:space-y-8 p-4 sm:p-8 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl shadow-primary/10">
      <div className="space-y-2 sm:space-y-3 text-center">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 sm:p-3.5 rounded-lg shadow-lg">
            <Palette className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
          Creative Studio
        </h1>
        <p className="text-sm sm:text-md text-muted-foreground">Join our creative community.</p>
      </div>

      <form action={formAction} className="space-y-4 sm:space-y-6">
        {state?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm">
            {state.success}
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
              className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary text-sm sm:text-base h-10 sm:h-11"
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
              className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:text-accent text-xs sm:text-sm">
            Log in
          </Link>
        </div>
      </form>
    </div>
  )
}
