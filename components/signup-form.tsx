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
      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-3 text-base font-semibold rounded-md h-12 shadow-md hover:shadow-lg transition-all"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        "CREATE ACCOUNT"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl shadow-primary/10">
      <div className="space-y-3 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-primary to-accent p-3.5 rounded-lg shadow-lg">
            <Palette className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
          Creative Studio
        </h1>
        <p className="text-md text-muted-foreground">Join our creative community.</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded-md text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-md text-sm">
            {state.success}
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
              className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary"
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
              className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-primary"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:text-accent">
            Log in
          </Link>
        </div>
      </form>
    </div>
  )
}
