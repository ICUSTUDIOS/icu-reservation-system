import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-black/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-300 tracking-tight">
                Creative Studio{" "}
                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 drop-shadow-lg trap-text-glow">
                  1
                </span>
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Member Access</Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground transition-shadow">
                  Apply Now
                </Button>
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
          </nav>
        </div>
      </div>
    </header>
  )
}
