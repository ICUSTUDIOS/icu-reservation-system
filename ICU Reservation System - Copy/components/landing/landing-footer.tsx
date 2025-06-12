export default function LandingFooter() {
  return (
    <footer className="border-t border-border/20 py-10 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Creative Studio 1. All Rights Reserved.</p>
        <p className="mt-2">A private, members-only facility.</p>
      </div>
    </footer>
  )
}
