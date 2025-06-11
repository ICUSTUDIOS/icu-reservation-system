import { Calendar, AlertTriangle, Wallet } from "lucide-react"

export default function PointsExplainer() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            The 40-Point Wallet System
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your monthly pass to creativity, designed for fairness and flexibility.
          </p>
        </div>

        <div className="bg-black/60 border border-border/30 rounded-2xl p-8 shadow-2xl shadow-black/50 backdrop-blur-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Monthly Point Refresh</h3>
              <p className="text-muted-foreground">
                Every member starts the month with <span className="font-bold text-primary">40 points</span>, equivalent
                to 20 hours of studio time during off-peak hours.
              </p>
            </div>
          </div>

          <div className="border-t border-border/20"></div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <p className="font-bold text-green-400">1 Point</p>
              <p className="text-sm text-muted-foreground">Weekday Daytime</p>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
              <p className="font-bold text-yellow-400">2 Points</p>
              <p className="text-sm text-muted-foreground">Weekday Evenings</p>
            </div>
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
              <p className="font-bold text-red-400">3 Points</p>
              <p className="text-sm text-muted-foreground">Weekends & Peak</p>
            </div>
          </div>

          <div className="border-t border-border/20"></div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <Calendar className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Fair Weekend Access</h3>
              <p className="text-muted-foreground">
                To ensure everyone gets a chance, peak "Red Zone" time is capped at{" "}
                <span className="font-bold text-red-400">3 hours</span> per member, per week.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Flexible Cancellations</h3>
              <p className="text-muted-foreground">
                Cancel <span className="font-semibold text-green-400">24+ hours</span> in advance for a full point
                refund. Late cancellations receive a <span className="font-bold">50% refund</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
