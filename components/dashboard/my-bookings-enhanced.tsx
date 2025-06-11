"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cancelBooking, type Booking } from "@/lib/booking-actions"
import { format, parseISO, differenceInMinutes, differenceInHours } from "date-fns"
import { Calendar, Clock, Trash2, Lightbulb, Sparkles, ArrowRight } from "lucide-react"
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
      toast.success("Reservation cancelled - Time slot is now available for booking!")
      
      // Trigger wallet refresh animation after successful cancellation
      setTimeout(() => {
        console.log("🔔 Dispatching wallet refresh event after cancellation...")
        window.dispatchEvent(new CustomEvent('wallet-refresh-needed'))
      }, 200)
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
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/10">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>MY RESERVATIONS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Lightbulb className="h-12 w-12 opacity-50" />
            <p className="text-lg">You have no reservations.</p>
            <p className="text-sm">Reserve studio time to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Separate past and future bookings
  const now = new Date()
  const futureBookings = bookings.filter(booking => parseISO(booking.start_time) > now)
  const pastBookings = bookings.filter(booking => parseISO(booking.start_time) <= now)

  return (
    <TooltipProvider>
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/10">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>MY RESERVATIONS ({bookings.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Future Bookings */}
        {futureBookings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              UPCOMING ({futureBookings.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {futureBookings.map((booking) => {
                const startTime = parseISO(booking.start_time)
                const endTime = parseISO(booking.end_time)
                const duration = calculateDuration(booking.start_time, booking.end_time)
                
                // Calculate refund policy
                const hoursUntilStart = differenceInHours(startTime, new Date())
                const refundPercentage = hoursUntilStart >= 24 ? 100 : 50
                const refundAmount = booking.points_cost ? Math.ceil(booking.points_cost * (refundPercentage / 100)) : 0

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
                      <div className="text-xs text-muted-foreground font-medium bg-secondary/20 px-2 py-1 rounded">
                        {duration}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(startTime, "MMM d, yyyy")}
                        </span>
                        {booking.points_cost && (
                          <span className="text-primary font-medium">
                            {booking.points_cost} pts
                          </span>
                        )}
                      </div>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="ml-2"
                          >
                            {cancellingId === booking.id ? (
                              "Cancelling..."
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3 mr-1" />
                                Cancel
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">
                            {refundPercentage}% refund ({refundAmount} points)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hoursUntilStart >= 24 
                              ? "More than 24h notice" 
                              : "Less than 24h notice"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              COMPLETED ({pastBookings.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastBookings.map((booking) => {
                const startTime = parseISO(booking.start_time)
                const endTime = parseISO(booking.end_time)
                const duration = calculateDuration(booking.start_time, booking.end_time)

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col p-4 border border-border/30 rounded-lg bg-background/30 opacity-75"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-secondary/20 p-1.5 rounded">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-lg font-semibold flex items-center text-muted-foreground">
                          {format(startTime, "h:mm a")}
                          <ArrowRight className="mx-1 h-3 w-3 opacity-50" />
                          {format(endTime, "h:mm a")}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium bg-secondary/10 px-2 py-1 rounded">
                        {duration}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(startTime, "MMM d, yyyy")}
                        </span>
                        {booking.points_cost && (
                          <span className="font-medium">
                            {booking.points_cost} pts
                          </span>
                        )}
                      </div>
                      
                      <span className="text-xs text-muted-foreground bg-secondary/10 px-2 py-1 rounded">
                        Completed
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}
