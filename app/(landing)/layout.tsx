import type React from "react"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 text-foreground">
      {children}
    </div>
  )
}
