import { Calendar, Clock, Star, Wallet } from "lucide-react"

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "Seamless Booking",
    description:
      "Instantly view available slots and reserve your time in just a few clicks. Your space, on your schedule.",
  },
  {
    icon: <Wallet className="h-8 w-8 text-primary" />,
    title: "Point-Based System",
    description: "A fair and flexible monthly point allocation lets you book prime-time or quiet-time slots.",
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Real-Time Updates",
    description: "Your wallet and bookings are always in sync, with real-time updates on every action.",
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: "Members-Only Access",
    description: "Join a curated community of creators in a private, professional, and inspiring environment.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-black/40 border-y border-border/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight">Built for the Modern Creator</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to manage your studio time, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-black/50 border border-border/30 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
