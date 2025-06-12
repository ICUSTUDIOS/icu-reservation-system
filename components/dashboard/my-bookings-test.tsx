"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Booking } from "@/lib/booking-actions"

interface MyBookingsProps {
  bookings: Booking[]
}

export default function MyBookingsTest({ bookings }: MyBookingsProps) {
  return (
    <Card className="bg-black/60 border-border/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-amber-300">
          MY RESERVATIONS - TEST
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-zinc-300">
          {bookings.length === 0 ? (
            <p>No reservations found.</p>
          ) : (
            <p>You have {bookings.length} reservation(s).</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
