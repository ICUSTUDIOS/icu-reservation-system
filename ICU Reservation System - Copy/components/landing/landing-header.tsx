import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions"
import ClientSignOutButton from "@/components/client-signout-button"

export default async function LandingHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-black/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300 tracking-tight">
                Creative Studio{" "}
                <span className="text-3xl font-black text-amber-500 drop-shadow-lg"
                      style={{ 
                        textShadow: '0 0 12px rgba(245, 158, 11, 0.8), 0 0 24px rgba(245, 158, 11, 0.6), 0 0 36px rgba(245, 158, 11, 0.4)' 
                      }}>
                  1
                </span>
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <ClientSignOutButton variant="outline">
                  Sign Out
                </ClientSignOutButton>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Member Access</Link>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground transition-shadow" asChild>
                  <Link href="/apply">Apply Now</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
