"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { createBooking, type Booking, getBookings } from "@/lib/booking-actions"
import { format, parseISO, isBefore, addMinutes, differenceInMinutes, isEqual, startOfDay } from "date-fns"
import { Clock, Sparkles, ArrowRight, X, CalendarDays, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface TimeSlotPickerProps {
  bookings: Booking[]
  weekendSlots: {
    used: number
    max: number
  }
}

export default function TimeSlotPicker({ bookings, weekendSlots }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [selection, setSelection] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  })
  const [isBooking, setIsBooking] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

    console.log(`Calculating booked slots for ${currentSelectedDateStr}`)
    console.log(`Total bookings available:`, bookings.length)

    bookings.forEach((booking) => {
      const bookingStartDate = parseISO(booking.start_time)
      const bookingDateStr = format(bookingStartDate, "yyyy-MM-dd")
      
      if (bookingDateStr !== currentSelectedDateStr) {
        return
      }
      
      console.log(`Found booking for ${currentSelectedDateStr}:`, booking)
      
      const bookingEndDate = parseISO(booking.end_time)
      let currentSlotTime = bookingStartDate
      while (isBefore(currentSlotTime, bookingEndDate)) { // Changed from isBefore to < so end time isn't marked as booked
        const slotTime = format(currentSlotTime, "HH:mm")
        booked.add(slotTime)
        console.log(`Marking slot ${slotTime} as booked`)
        currentSlotTime = addMinutes(currentSlotTime, 30)
      }
    })
    
    console.log(`Booked slots for ${currentSelectedDateStr}:`, Array.from(booked))
    return booked
  }, [selectedDate, bookings])

  // Add past slots detection
  const pastSlots = useMemo(() => {
    const past = new Set<string>()
    const now = new Date()
    const currentSelectedDateStr = format(selectedDate, "yyyy-MM-dd")
    const todayStr = format(now, "yyyy-MM-dd")
    
    // If selected date is in the past, all slots are past
    if (isBefore(selectedDate, startOfDay(now))) {
      timeSlots.forEach(slot => past.add(slot))
      return past
    }
    
    // If selected date is today, mark past time slots
    if (currentSelectedDateStr === todayStr) {
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      timeSlots.forEach(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number)
        // Mark slot as past if it's before current time
        if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
          past.add(slot)
        }
      })
    }
    
    return past
  }, [selectedDate, timeSlots])

  useEffect(() => {
    setSelection({ start: null, end: null })
    // Clear any cached booking slot states when bookings data changes
    console.log("Time slot picker refreshed due to booking changes", bookings.length)
  }, [selectedDate, bookings])

  const handleSlotClick = (time: string) => {
    if (bookedSlots.has(time)) {
      toast.error("This slot is already reserved.")
      return
    }
    
    if (pastSlots.has(time)) {
      toast.error("Cannot book time slots in the past.")
      return
    }
    
    const { start, end } = selection
    
    // If no start time selected, or if both start and end are selected, start fresh
    if (!start || (start && end)) {
      setSelection({ start: time, end: null })
      toast.success(`Start time set: ${format(timeStringToDate(time, new Date()), "h:mm a")}. Now click on an end time.`, {
        duration: 3000
      })
      return
    }
    
    // If we have a start time, this click is for the end time
    const startIndex = timeSlots.indexOf(start)
    const clickedIndex = timeSlots.indexOf(time)
    
    // If clicking the same slot as start, show error
    if (clickedIndex === startIndex) {
      toast.error("End time must be different from start time.")
      return
    }
    
    // If clicking before start time, restart selection
    if (clickedIndex < startIndex) {
      setSelection({ start: time, end: null })
      toast.success(`Start time changed: ${format(timeStringToDate(time, new Date()), "h:mm a")}. Now click on an end time.`, {
        duration: 3000
      })
      return
    }
    
    // Check if any slots in the range are booked or past
    for (let i = startIndex; i < clickedIndex; i++) { // Note: < not <= because end slot should be available for others
      if (bookedSlots.has(timeSlots[i])) {
        toast.error(`Cannot book this range - the ${format(timeStringToDate(timeSlots[i], new Date()), "h:mm a")} slot is already reserved.`)
        return
      }
      if (pastSlots.has(timeSlots[i])) {
        toast.error(`Cannot book this range - the ${format(timeStringToDate(timeSlots[i], new Date()), "h:mm a")} slot is in the past.`)
        return
      }
    }
    
    // Set the end time with success feedback
    setSelection({ start: start, end: time })
    const duration = calculateDurationForRange(start, time)
    toast.success(`Time range selected: ${format(timeStringToDate(start, new Date()), "h:mm a")} to ${format(timeStringToDate(time, new Date()), "h:mm a")} (${duration})`, {
      duration: 4000
    })
  }

  const calculateDurationForRange = (startTime: string, endTime: string): string => {
    const start = timeStringToDate(startTime, selectedDate)
    const end = timeStringToDate(endTime, selectedDate)
    
    const durationMinutes = differenceInMinutes(end, start)
    
    if (durationMinutes <= 0) return "30 MIN" // Fallback
    
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    
    return `${hours > 0 ? `${hours} HR ` : ""}${minutes > 0 ? `${minutes} MIN` : ""}`.trim() || "30 MIN"
  }

  const timeStringToDate = (timeString: string, baseDate: Date): Date => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const date = new Date(baseDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Force a page refresh to get latest booking data
      window.location.reload()
    } catch (error) {
      toast.error("Failed to refresh time slots")
      setIsRefreshing(false)
    }
  }

  const handleBooking = async () => {
    if (!selection.start || !selection.end) {
      toast.error("Please select both start and end times.")
      return
    }
    
    // Validate weekend slot limits before submitting
    const { weekendSlots: slotsNeeded, isWeekend } = calculateCost()
    if (isWeekend && (weekendSlots.used + slotsNeeded) > weekendSlots.max) {
      const remaining = weekendSlots.max - weekendSlots.used
      toast.error(
        `Weekend slot limit exceeded! You need ${slotsNeeded} slots but have only ${remaining} remaining (${weekendSlots.used}/${weekendSlots.max} used).`
      )
      return
    }
    
    setIsBooking(true)
    const startDateTime = timeStringToDate(selection.start, selectedDate)
    const endDateTime = timeStringToDate(selection.end, selectedDate)
    
    // Validate time range
    if (!isBefore(startDateTime, endDateTime)) {
      toast.error("End time must be after start time.")
      setIsBooking(false)
      return
    }
    
    const result = await createBooking(startDateTime.toISOString(), endDateTime.toISOString())
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Session locked in! Time to create 🔥")
      setSelection({ start: null, end: null }) // Clear selection after successful booking
      
      // Trigger a brief delay to ensure the wallet updates properly
      setTimeout(() => {
        // Dispatch a custom event to trigger wallet refresh if real-time fails
        window.dispatchEvent(new CustomEvent('wallet-refresh-needed'))
      }, 500)
    }
    setIsBooking(false)
  }

  const calculateDuration = (): string => {
    if (!selection.start || !selection.end) return "-- MIN"
    
    return calculateDurationForRange(selection.start, selection.end)
  }

  const calculateCost = (): { totalCost: number; weekendSlots: number; isWeekend: boolean } => {
    if (!selection.start || !selection.end) return { totalCost: 0, weekendSlots: 0, isWeekend: false }

    const startTime = timeStringToDate(selection.start, selectedDate)
    const endTime = timeStringToDate(selection.end, selectedDate)
    
    // Handle single slot selection (start === end)
    if (selection.start === selection.end) {
      const dayOfWeek = startTime.getDay()
      const hour = startTime.getHours()
      
      let cost = 1 // Default weekday rate
      let weekendSlots = 0
      
      if ((dayOfWeek === 5 && hour >= 17) || dayOfWeek === 0 || dayOfWeek === 6) {
        cost = 3 // Weekend rate
        weekendSlots = 1
      } else if (dayOfWeek >= 1 && dayOfWeek <= 4 && hour >= 17 && hour < 21) {
        cost = 2 // Weekday evening rate
      }
      
      return { totalCost: cost, weekendSlots, isWeekend: weekendSlots > 0 }
    }
    
    // For range selections, calculate cost for the selected range
    // User selects 7:30 PM → 8:00 PM = 30 minutes = 1 slot
    // User selects 7:30 PM → 8:30 PM = 60 minutes = 2 slots
    
    let totalCost = 0
    let weekendSlots = 0
    
    // Calculate number of 30-minute slots in the selected range
    const durationMinutes = differenceInMinutes(endTime, startTime)
    const numberOfSlots = Math.max(1, durationMinutes / 30)
    
    // Calculate cost for each slot starting from the start time
    for (let i = 0; i < numberOfSlots; i++) {
      const current = addMinutes(startTime, i * 30)
      const dayOfWeek = current.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
      const hour = current.getHours()

      // Three-tier pricing system:
      // 1. Weekend (Fri 17:00+ & all day Sat-Sun) = 3 points
      // 2. Weekday evenings (Mon-Thu 17:00-21:00) = 2 points  
      // 3. Weekday daytime (Mon-Thu 09:00-17:00, Fri 09:00-17:00) = 1 point
      
      if ((dayOfWeek === 5 && hour >= 17) || dayOfWeek === 0 || dayOfWeek === 6) {
        totalCost += 3 // Weekend rate
        weekendSlots += 1
      } else if (dayOfWeek >= 1 && dayOfWeek <= 4 && hour >= 17 && hour < 21) {
        totalCost += 2 // Weekday evening rate
      } else {
        totalCost += 1 // Weekday daytime rate
      }
    }

    return { totalCost, weekendSlots, isWeekend: weekendSlots > 0 }
  }

  // Helper function to determine slot pricing tier
  const getSlotPricingTier = (time: string): 'weekday' | 'evening' | 'weekend' => {
    const slotDate = timeStringToDate(time, selectedDate)
    const dayOfWeek = slotDate.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
    const hour = slotDate.getHours()

    // Three-tier pricing system:
    if ((dayOfWeek === 5 && hour >= 17) || dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend' // Fri 17:00+ & all day Sat-Sun = 3 points
    } else if (dayOfWeek >= 1 && dayOfWeek <= 4 && hour >= 17 && hour < 21) {
      return 'evening' // Mon-Thu 17:00-21:00 = 2 points
    } else {
      return 'weekday' // Mon-Thu 09:00-17:00, Fri 09:00-17:00 = 1 point
    }
  }

  const showBookingControls = !!(selection.start && selection.end)
  const { totalCost, weekendSlots: weekendSlotsNeeded, isWeekend } = calculateCost()

  return (
    <div id="time-slot-picker" className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <Card className="bg-black/60 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/50">
        <CardHeader className="border-b border-border/30 bg-black/40">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>SELECT DATE - {format(selectedDate, "MMMM yyyy").toUpperCase()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex justify-center">
          <CalendarUI
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(startOfDay(date))}
            disabled={(date) => isBefore(date, startOfDay(new Date()))}
            className="rounded-md"
          />
        </CardContent>
      </Card>

      <Card className="bg-black/60 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/50">
        <CardHeader className="border-b border-border/30 bg-black/40">
          <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            <span>SELECT TIME - {format(selectedDate, "MMMM d, yyyy").toUpperCase()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-auto text-xs"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
            {timeSlots.map((time) => {
              const isBooked = bookedSlots.has(time)
              const isPast = pastSlots.has(time)
              const isStart = selection.start === time
              const isEnd = selection.end === time
              const startIndex = selection.start ? timeSlots.indexOf(selection.start) : -1
              const endIndex = selection.end ? timeSlots.indexOf(selection.end) : -1
              const isInRange =
                startIndex !== -1 &&
                endIndex !== -1 &&
                timeSlots.indexOf(time) >= startIndex &&
                timeSlots.indexOf(time) < endIndex // Changed <= to < so end slot isn't highlighted as "in range"

              const pricingTier = getSlotPricingTier(time)
              const isWeekendSlot = pricingTier === 'weekend'
              const isEveningSlot = pricingTier === 'evening'
              const isWeekdaySlot = pricingTier === 'weekday'

              return (
                <Button
                  key={time}
                  variant="outline"
                  onClick={() => handleSlotClick(time)}
                  disabled={isBooked || isPast}
                  className={cn(
                    "h-10 sm:h-11 text-[10px] leading-tight sm:text-xs font-medium transition-all duration-150 ease-in-out p-1 backdrop-blur-sm relative",
                    // Base pricing tier colors (when not booked/selected/past)
                    !isBooked && !isPast && !isStart && !isEnd && !isInRange && isWeekendSlot && 
                      "border-orange-500/60 bg-gradient-to-b from-orange-900/40 to-orange-800/30 text-orange-100 hover:bg-gradient-to-b hover:from-orange-800/50 hover:to-orange-700/40 hover:border-orange-400/70",
                    !isBooked && !isPast && !isStart && !isEnd && !isInRange && isEveningSlot && 
                      "border-yellow-500/60 bg-gradient-to-b from-yellow-900/40 to-yellow-800/30 text-yellow-100 hover:bg-gradient-to-b hover:from-yellow-800/50 hover:to-yellow-700/40 hover:border-yellow-400/70",
                    !isBooked && !isPast && !isStart && !isEnd && !isInRange && isWeekdaySlot && 
                      "border-blue-500/50 bg-gradient-to-b from-blue-900/30 to-blue-800/20 text-blue-100 hover:bg-gradient-to-b hover:from-blue-800/40 hover:to-blue-700/30 hover:border-blue-400/60",
                    // Booked state
                    isBooked && "bg-muted/20 text-muted-foreground cursor-not-allowed hover:bg-muted/20 ring-0 border-muted/30",
                    // Past state
                    isPast && "bg-red-950/20 text-red-400/60 cursor-not-allowed hover:bg-red-950/20 ring-0 border-red-800/30 opacity-50",
                    // Selection states (override pricing colors)
                    (isStart || isEnd || isInRange) &&
                      !isBooked && !isPast &&
                      "text-white ring-offset-background ring-offset-2 shadow-lg",
                    isStart &&
                      !isBooked && !isPast &&
                      "bg-gradient-to-br from-green-600 to-green-500 hover:from-green-500/90 hover:to-green-400/90 border-transparent ring-2 ring-green-400 shadow-lg shadow-green-500/20",
                    isEnd &&
                      !isBooked && !isPast &&
                      "bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500/90 hover:to-red-400/90 border-transparent ring-2 ring-red-400 shadow-lg shadow-red-500/20",
                    isInRange &&
                      !isStart &&
                      !isEnd &&
                      !isBooked && !isPast &&
                      "bg-gradient-to-r from-blue-600/70 via-blue-500/50 to-blue-600/70 border-blue-400/60 hover:from-blue-500/80 hover:to-blue-500/80 text-white shadow-md shadow-blue-500/20",
                  )}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="leading-none">
                      {format(timeStringToDate(time, new Date()), "h:mm a")}
                    </span>
                    {isPast && (
                      <span className="text-[8px] leading-none font-bold text-red-400/60">
                        PAST
                      </span>
                    )}
                    {isStart && !isBooked && !isPast && (
                      <span className="text-[8px] leading-none font-bold text-green-100">
                        START
                      </span>
                    )}
                    {isEnd && !isBooked && !isPast && (
                      <span className="text-[8px] leading-none font-bold text-red-100">
                        END
                      </span>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Pricing Legend */}
          <div className="flex items-center justify-center gap-4 py-2 px-4 bg-black/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-blue-500/50 bg-gradient-to-b from-blue-900/40 to-blue-800/30"></div>
              <span className="text-xs text-blue-200/90 font-medium">Weekday (1pt)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-yellow-500/60 bg-gradient-to-b from-yellow-900/40 to-yellow-800/30"></div>
              <span className="text-xs text-yellow-200/90 font-medium">Evening (2pt)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-orange-500/60 bg-gradient-to-b from-orange-900/40 to-orange-800/30"></div>
              <span className="text-xs text-orange-200/90 font-medium">Weekend (3pt)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-muted/30 bg-muted/20"></div>
              <span className="text-xs text-muted-foreground font-medium">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-red-800/30 bg-red-950/20 opacity-50"></div>
              <span className="text-xs text-red-400/60 font-medium">Past</span>
            </div>
          </div>

          {/* Selection Instructions */}
          <div className="flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-950/30 to-purple-950/30 rounded-lg border border-border/30">
            <div className="text-center">
              {!selection.start ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">Click on a time slot to set your start time</span>
                </div>
              ) : !selection.end ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">
                    Start: {format(timeStringToDate(selection.start, new Date()), "h:mm a")} - Now click on an end time
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">
                    Range selected - Ready to book!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Booking System Explanation */}
          <div className="bg-gradient-to-r from-slate-950/50 to-slate-900/50 p-3 rounded-lg border border-border/30">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-medium text-slate-200">How it works:</span> When you book 10:30 to 11:30, you reserve the studio from 10:30 AM until 11:30 AM. 
                The 11:30 slot remains available for others to book from 11:30 onwards.
              </div>
            </div>
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
                            <span>{format(timeStringToDate(selection.end, new Date()), "h:mm a")}</span>
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
                    onClick={() => {
                      setSelection({ start: null, end: null })
                      toast.info("Selection cleared")
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">COST BREAKDOWN:</p>
                  <div className="flex flex-col space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-foreground">Points from your wallet:</p>
                      <p className="text-lg font-bold text-accent">
                        {totalCost} {totalCost === 1 ? "point" : "points"}
                      </p>
                    </div>
                    {isWeekend && (
                      <>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-medium text-amber-400">Weekend Rate Applied:</p>
                            <p className="text-sm font-medium text-amber-300">
                              {weekendSlotsNeeded} slot{weekendSlotsNeeded > 1 ? "s" : ""} × 3 points each
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-amber-400/20">
                            <p className="text-xs font-medium text-amber-400">Weekend Slots:</p>
                            <p className={cn(
                              "text-sm font-medium",
                              (weekendSlots.used + weekendSlotsNeeded) > weekendSlots.max 
                                ? "text-red-400" 
                                : (weekendSlots.used + weekendSlotsNeeded) === weekendSlots.max
                                ? "text-orange-400"
                                : "text-amber-300"
                            )}>
                              {weekendSlots.used + weekendSlotsNeeded}/{weekendSlots.max} used
                            </p>
                          </div>
                          {(weekendSlots.used + weekendSlotsNeeded) > weekendSlots.max && (
                            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                              <p className="text-xs text-red-400 font-medium">
                                ⚠️ This booking would exceed your weekend limit!
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-amber-100/80">
                            This booking uses your weekend slot limit + points from your main wallet.
                          </p>
                        </div>
                      </>
                    )}
                    <div className="text-xs text-muted-foreground pt-1 space-y-1">
                      <p><strong>Rate:</strong> Weekdays 1pt • Evenings 2pt • Weekend (Fri 5pm+, Sat-Sun) 3pt per 30min</p>
                      {isWeekend && (
                        <p className="text-amber-300/80">
                          <strong>Note:</strong> Weekend bookings also count toward your weekly weekend limit.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 rounded-full p-4 mb-4 border border-border/30">
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-foreground text-sm font-medium mb-1">Ready to Book Your Session</p>
                <p className="text-muted-foreground text-xs mb-3">Choose your start and end times from the grid above</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border bg-green-600/80"></div>
                    <span>Start</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border bg-blue-600/80"></div>
                    <span>Range</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border bg-red-600/80"></div>
                    <span>End</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
