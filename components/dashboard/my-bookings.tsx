"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cancelBooking, type Booking } from "@/lib/booking-actions"
import { format, parseISO, differenceInMinutes, differenceInHours, isPast } from "date-fns"
import { Calendar, Clock, Trash2, Lightbulb, Sparkles, ArrowRight, CheckCircle, History } from "lucide-react"
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

  // Separate past and future bookings
  const now = new Date()
  const futureBookings = bookings.filter(booking => !isPast(parseISO(booking.start_time)))
  const pastBookings = bookings.filter(booking => isPast(parseISO(booking.start_time)))

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
            <p className="text-muted-foreground text-lg">You have no reservations.</p>
            <p className="text-muted-foreground/70 mt-2">Reserve studio time to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderBookingCard = (booking: Booking, isPastBooking: boolean = false) => {
    const startTime = parseISO(booking.start_time)
    const endTime = parseISO(booking.end_time)
    const duration = calculateDuration(booking.start_time, booking.end_time)
    
    // Calculate refund policy (only for future bookings)
    const hoursUntilStart = differenceInHours(startTime, new Date())
    const refundPercentage = hoursUntilStart >= 24 ? 100 : 50
    const refundAmount = booking.points_cost ? Math.ceil(booking.points_cost * (refundPercentage / 100)) : 0

    return (
      <div
        key={booking.id}
        className={`flex flex-col p-4 border rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
          isPastBooking 
            ? "border-border/30 bg-background/30 opacity-75" 
            : "border-border/50 bg-background/50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${isPastBooking ? "bg-muted/30" : "bg-secondary/30"}`}>
              {isPastBooking ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-primary" />
              )}
            </div>
            <span className="text-lg font-semibold flex items-center text-foreground">
              {format(startTime, "h:mm a")}
              <ArrowRight className="mx-1 h-3 w-3 opacity-70 text-muted-foreground" />
              {format(endTime, "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isPastBooking 
                ? "bg-green-500/10 text-green-600" 
                : "bg-primary/10 text-primary"
            }`}>
              {duration}
            </div>
            {isPastBooking && (
              <Badge variant="secondary" className="text-xs">
                <History className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
          {booking.points_cost && (
            <span className="ml-auto text-xs bg-muted/50 px-2 py-1 rounded">
              {booking.points_cost} points
            </span>
          )}
        </div>

        {!isPastBooking && (
          <div className="mt-auto pt-3 border-t border-border/50 flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent className="bg-background/95 border-border text-foreground">
                <div className="text-center">
                  <p className="font-semibold text-sm">
                    {refundPercentage}% Refund ({refundAmount} points)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hoursUntilStart >= 24 
                      ? `>24h notice: Full refund` 
                      : `<24h notice: Partial refund`}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    )
  }

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
          {futureBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                UPCOMING ({futureBookings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {futureBookings.map((booking) => renderBookingCard(booking, false))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                COMPLETED ({pastBookings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastBookings.map((booking) => renderBookingCard(booking, true))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
