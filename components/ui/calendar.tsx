"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = {
  className?: string
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
}

function Calendar({ className, selected, onSelect, disabled }: CalendarProps) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthName = firstDayOfMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    if (disabled && disabled(clickedDate)) return
    onSelect?.(clickedDate)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const dayDate = new Date(currentYear, currentMonth, day)
    return selected.toDateString() === dayDate.toDateString()
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
  }

  const isDisabled = (day: number) => {
    if (!disabled) return false
    const dayDate = new Date(currentYear, currentMonth, day)
    return disabled(dayDate)
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 px-4 pt-4">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2 sm:py-3">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 px-4 pb-4">
        {calendarDays.map((day, index) => (
          <div key={index} className="aspect-square">
            {" "}
            {/* Ensures cells are square and scale together */}
            {day ? (
              <Button
                variant="ghost"
                onClick={() => handleDayClick(day)}
                disabled={isDisabled(day)}
                className={cn(
                  "w-full h-full p-0 text-sm sm:text-base font-normal rounded-md transition-colors duration-150",
                  "hover:bg-secondary/50 hover:text-secondary-foreground",
                  isSelected(day) &&
                    "bg-gradient-to-br from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 shadow-md",
                  isToday(day) && !isSelected(day) && "bg-secondary text-secondary-foreground",
                  isDisabled(day) && "text-muted-foreground/50 opacity-50 cursor-not-allowed hover:bg-transparent",
                )}
              >
                {day}
              </Button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"
export { Calendar }
