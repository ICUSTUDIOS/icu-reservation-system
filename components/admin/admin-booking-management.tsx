"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface Booking {
  id: string
  user_id: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  members?: {
    full_name: string
    email: string
  }
}

interface AdminBookingManagementProps {
  bookings: Booking[]
}

export default function AdminBookingManagement({ bookings }: AdminBookingManagementProps) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleCancelBooking = async (bookingId: string) => {
    setProcessing(bookingId)
    // TODO: Implement booking cancellation
    console.log(`Cancelling booking ${bookingId}`)
    setProcessing(null)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'cancelled':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings found.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {booking.members?.full_name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.members?.email}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Time:</span> {formatDateTime(booking.start_time)} - {formatDateTime(booking.end_time)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Booked: {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={processing === booking.id}
                    >
                      {processing === booking.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
