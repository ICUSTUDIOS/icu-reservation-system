"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cancelBooking, type Booking } from "@/lib/booking-actions"
import { Sparkles, Lightbulb, Calendar, Clock, Trash2, CheckCircle, History } from "lucide-react"
import { toast } from "sonner"

interface MyBookingsProps {
  bookings: Booking[]
}

export default function MyBookings({ bookings: initialBookings }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Update local bookings when initial bookings change (page refresh)
  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId)
    const result = await cancelBooking(bookingId)
    if (result.error) {
      toast.error(result.error)
    } else {
      // Immediately remove the booking from local state for instant UI update
      setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId))
      
      toast.success("Reservation cancelled - Time slot is now available for booking!")
      
      // Trigger wallet refresh animation after successful cancellation
      setTimeout(() => {
        console.log("🔔 Dispatching wallet refresh event after cancellation...")
        window.dispatchEvent(new CustomEvent('wallet-refresh-needed'))
      }, 200)
    }
    setCancellingId(null)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    const diffMinutes = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    if (hours === 0) return `${minutes} MIN`
    if (minutes === 0) return `${hours} HR`
    return `${hours} HR ${minutes} MIN`
  }

  // Separate past and future bookings
  const now = new Date()
  const futureBookings = bookings.filter(booking => new Date(booking.start_time) > now)
  const pastBookings = bookings.filter(booking => new Date(booking.start_time) <= now)

  if (bookings.length === 0) {
    return (
      <Card id="my-reservations" className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl shadow-secondary/10">
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
  return (
    <Card id="my-reservations" className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/10">
      <CardHeader className="border-b border-border/50 bg-card/50">
        <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>MY RESERVATIONS</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Future Bookings */}
        {futureBookings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-foreground">Upcoming Reservations</h3>
            </div>
            <div className="space-y-4">
              {futureBookings.map((booking) => renderBookingCard(booking, false))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-muted-foreground">Past Sessions</h3>
            </div>
            <div className="space-y-4">
              {pastBookings.map((booking) => renderBookingCard(booking, true))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  function renderBookingCard(booking: Booking, isPastBooking: boolean = false) {
    const startDateTime = formatDateTime(booking.start_time)
    const endDateTime = formatDateTime(booking.end_time)
    const duration = calculateDuration(booking.start_time, booking.end_time)
    
    // Calculate refund policy (only for future bookings)
    const hoursUntilStart = Math.round((new Date(booking.start_time).getTime() - new Date().getTime()) / (1000 * 60 * 60))
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
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                {startDateTime.date}
              </p>
              <p className="text-xs text-muted-foreground">
                {startDateTime.time} - {endDateTime.time}
              </p>
            </div>
          </div>
          <Badge variant={isPastBooking ? "secondary" : "default"} 
                 className={isPastBooking ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary border-primary/30"}>
            {isPastBooking ? "Completed" : booking.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            {booking.points_cost && (
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span>{booking.points_cost} points</span>
              </div>
            )}
          </div>
          
          {!isPastBooking && (
            <div className="flex items-center gap-3">
              {hoursUntilStart < 24 && (
                <span className="text-xs text-yellow-400">
                  50% refund
                </span>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="bg-destructive/20 hover:bg-destructive/30 text-destructive border-destructive/30"
                onClick={() => handleCancel(booking.id)}
                disabled={cancellingId === booking.id}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
}
