"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { createBooking, type Booking } from "@/lib/booking-actions"
import { format, parseISO, isBefore, addMinutes, differenceInMinutes, isEqual, startOfDay } from "date-fns"
import { Clock, Sparkles, ArrowRight, X, CalendarDays } from "lucide-react"
import { toast } from "sonner"

interface TimeSlotPickerProps {
  bookings: Booking[]
}

export default function TimeSlotPicker({ bookings }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [selection, setSelection] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })
  const [isBooking, setIsBooking] = useState(false)

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = 9; hour < 21; hour++) {
      slots.push(`${String(hour).padStart(2, "0")}:00`)
      slots.push(`${String(hour).padStart(2, "0")}:30`)
    }
    return slots
  }, [])

  const bookedSlots = useMemo(() => {
    const booked = new Set<string>()
    const currentSelectedDateStr = format(selectedDate, "yyyy-MM-dd")

    bookings.forEach((booking) => {
      const bookingStartDate = parseISO(booking.start_time)
      if (format(bookingStartDate, "yyyy-MM-dd") !== currentSelectedDateStr) {
        return
      }
      const bookingEndDate = parseISO(booking.end_time)
      let currentSlotTime = bookingStartDate
      while (isBefore(currentSlotTime, bookingEndDate)) {
        booked.add(format(currentSlotTime, "HH:mm"))
        currentSlotTime = addMinutes(currentSlotTime, 30)
      }
    })
    return booked
  }, [selectedDate, bookings])

  useEffect(() => {
    setSelection({ start: null, end: null })
  }, [selectedDate, bookings])

  const handleSlotClick = (time: string) => {
    if (bookedSlots.has(time)) {
      toast.error("This slot is part of an existing booking.")
      return
    }
    const { start, end } = selection
    if (!start || (start && end)) {
      setSelection({ start: time, end: null })
    } else {
      const startIndex = timeSlots.indexOf(start)
      const clickedIndex = timeSlots.indexOf(time)
      if (clickedIndex < startIndex) {
        setSelection({ start: time, end: null })
        return
      }
      for (let i = startIndex; i <= clickedIndex; i++) {
        if (bookedSlots.has(timeSlots[i])) {
          toast.error("Selection overlaps with a booked slot.")
          setSelection({ start: start, end: null })
          return
        }
      }
      setSelection({ ...selection, end: time })
    }
  }

  const timeStringToDate = (timeString: string, baseDate: Date): Date => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const date = new Date(baseDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const handleBooking = async () => {
    if (!selection.start || !selection.end) {
      toast.error("Please select a valid start and end time.")
      return
    }
    setIsBooking(true)
    const startDateTime = timeStringToDate(selection.start, selectedDate)
    const endSlotTime = timeStringToDate(selection.end, selectedDate)
    const endDateTime = addMinutes(endSlotTime, 30)

    if (isBefore(endDateTime, startDateTime) || isEqual(endDateTime, startDateTime)) {
      toast.error("End time must be after start time.")
      setIsBooking(false)
      return
    }
    const result = await createBooking(startDateTime.toISOString(), endDateTime.toISOString())
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Session locked in! Time to create 🔥")
    }
    setIsBooking(false)
  }

  const calculateDuration = (): string => {
    if (!selection.start || !selection.end) return "0 MIN"
    const start = timeStringToDate(selection.start, new Date())
    const end = addMinutes(timeStringToDate(selection.end, new Date()), 30)
    const diff = differenceInMinutes(end, start)
    if (diff <= 0) return "0 MIN"
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours > 0 ? `${hours} HR ` : ""}${minutes > 0 ? `${minutes} MIN` : ""}`.trim()
  }

  const showBookingControls = !!(selection.start && selection.end)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <Card className="bg-black/60 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/50">
        <CardHeader className="border-b border-border/30 bg-black/40">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>SELECT DATE - {format(selectedDate, "MMMM yyyy").toUpperCase()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex justify-center">
          <CalendarUI
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(startOfDay(date))}
            disabled={(date) => isBefore(date, startOfDay(new Date()))}
            className="rounded-md"
            initialFocus
          />
        </CardContent>
      </Card>

      <Card className="bg-black/60 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/50">
        <CardHeader className="border-b border-border/30 bg-black/40">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            <span>SELECT TIME - {format(selectedDate, "MMMM d, yyyy").toUpperCase()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
            {timeSlots.map((time) => {
              const isBooked = bookedSlots.has(time)
              const isStart = selection.start === time
              const isEnd = selection.end === time
              const startIndex = selection.start ? timeSlots.indexOf(selection.start) : -1
              const endIndex = selection.end ? timeSlots.indexOf(selection.end) : -1
              const isInRange =
                startIndex !== -1 &&
                endIndex !== -1 &&
                timeSlots.indexOf(time) >= startIndex &&
                timeSlots.indexOf(time) <= endIndex

              return (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => handleSlotClick(time)}
                  disabled={isBooked}
                  className={cn(
                    "h-10 sm:h-11 text-[10px] leading-tight sm:text-xs font-medium border-border/50 bg-black/40 hover:bg-black/60 transition-all duration-150 ease-in-out p-1 text-foreground/80 backdrop-blur-sm",
                    isBooked && "bg-muted/20 text-muted-foreground cursor-not-allowed hover:bg-muted/20 ring-0",
                    (isStart || isEnd || isInRange) &&
                      !isBooked &&
                      "text-primary-foreground ring-offset-background ring-offset-2",
                    isStart &&
                      !isBooked &&
                      "bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-transparent ring-2 ring-primary shadow-trap-glow",
                    isEnd &&
                      !isBooked &&
                      "bg-gradient-to-br from-accent to-primary hover:from-accent/90 hover:to-primary/90 border-transparent ring-2 ring-accent shadow-trap-glow",
                    isInRange &&
                      !isStart &&
                      !isEnd &&
                      !isBooked &&
                      "bg-gradient-to-r from-primary/30 via-transparent to-accent/30 border-border/30 hover:from-primary/40 hover:to-accent/40 text-foreground",
                  )}
                >
                  {format(timeStringToDate(time, new Date()), "h:mm a")}
                </Button>
              )
            })}
          </div>

          <div className="h-auto min-h-[140px] sm:min-h-[150px] pt-4 md:pt-6 border-t border-border/30 flex flex-col justify-between">
            {selection.start ? (
              <>
                <div className="bg-black/40 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 border border-border/30 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">SELECTED:</p>
                      <div className="text-md sm:text-lg font-bold flex items-center gap-1 sm:gap-2 mt-0.5 text-foreground">
                        <span>{format(timeStringToDate(selection.start, new Date()), "h:mm a")}</span>
                        {selection.end && (
                          <>
                            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span>{format(addMinutes(timeStringToDate(selection.end, new Date()), 30), "h:mm a")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {selection.end && (
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">DURATION:</p>
                        <p className="text-md sm:text-lg font-bold text-accent mt-0.5 trap-text-glow">
                          {calculateDuration()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-auto space-y-2">
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking || !showBookingControls}
                    className={cn(
                      "w-full h-11 sm:h-12 text-sm sm:text-base text-primary-foreground font-semibold transition-all duration-300 ease-in-out transform active:scale-95",
                      showBookingControls
                        ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 opacity-100 shadow-trap-glow hover:shadow-trap-glow-strong"
                        : "bg-muted/30 text-muted-foreground opacity-60 cursor-not-allowed",
                    )}
                  >
                    {isBooking ? "PROCESSING..." : "LOCK IN SESSION"}{" "}
                    {!isBooking && <Sparkles className="ml-2 h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground hover:bg-black/30 transition-colors h-9 sm:h-10"
                    onClick={() => setSelection({ start: null, end: null })}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">Select an available time slot to begin.</p>
                <p className="text-muted-foreground/70 text-xs mt-1">Click a start time, then an end time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
