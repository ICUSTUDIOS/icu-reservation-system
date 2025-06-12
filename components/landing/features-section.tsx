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
    <section className="py-12 sm:py-20 md:py-28 bg-black/40 border-y border-border/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Built for the Modern Creator</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
            Everything you need to manage your studio time, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-4 sm:p-6 bg-black/50 border border-border/30 rounded-xl shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-primary/10 border border-primary/20 mb-4 sm:mb-6 mx-auto sm:mx-0">
                <div className="scale-75 sm:scale-100">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center sm:text-left">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base text-center sm:text-left">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
