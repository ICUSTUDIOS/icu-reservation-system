import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/signup-form"

export default async function SignUpPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-background to-zinc-800 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-center bg-cover opacity-5 mix-blend-overlay"></div>
      <div className="relative z-10">
        <SignUpForm />
      </div>
    </div>
  )
}
