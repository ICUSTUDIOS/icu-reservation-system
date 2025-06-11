"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cancelBooking, type Booking } from "@/lib/booking-actions"
import { format, parseISO, differenceInMinutes } from "date-fns"
import { Calendar, Clock, Trash2, Lightbulb, Sparkles, ArrowRight } from "lucide-react" // Changed icons
import { toast } from "sonner"

interface MyBookingsProps {
  bookings: Booking[]
}

export default function MyBookings({ bookings }: MyBookingsProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId)
    const result = await cancelBooking(bookingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Reservation cancelled")
    }
    setCancellingId(null)
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    const diffMinutes = differenceInMinutes(end, start)
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    if (hours === 0) return `${minutes} MIN`
    if (minutes === 0) return `${hours} HR`
    return `${hours} HR ${minutes} MIN`
  }

  if (bookings.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl shadow-secondary/10">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>MY RESERVATIONS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-lg">You have no upcoming reservations.</p>
            <p className="text-muted-foreground/70 mt-2">Reserve studio time to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/10">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>MY RESERVATIONS ({bookings.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const startTime = parseISO(booking.start_time)
            const endTime = parseISO(booking.end_time)
            const duration = calculateDuration(booking.start_time, booking.end_time)

            return (
              <div
                key={booking.id}
                className="flex flex-col p-4 border border-border/50 rounded-lg bg-background/50 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 p-1.5 rounded">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-lg font-semibold flex items-center text-foreground">
                      {format(startTime, "h:mm a")}
                      <ArrowRight className="mx-1 h-3 w-3 opacity-70 text-muted-foreground" />
                      {format(endTime, "h:mm a")}
                    </span>
                  </div>
                  <div className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                    {duration}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
                </div>

                <div className="mt-auto pt-3 border-t border-border/50 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="text-destructive-foreground/80 border-destructive/50 bg-destructive/20 hover:bg-destructive/30 hover:text-destructive-foreground"
                  >
                    {cancellingId === booking.id ? (
                      "CANCELLING..."
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        CANCEL BOOKING
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
