"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  className?: string
  classNames?: {
    months?: string
    month?: string
    caption?: string
    caption_label?: string
    nav?: string
    nav_button?: string
    nav_button_previous?: string
    nav_button_next?: string
    table?: string
    head_row?: string
    head_cell?: string
    row?: string
    cell?: string
    day?: string
    day_range_end?: string
    day_selected?: string
    day_today?: string
    day_outside?: string
    day_disabled?: string
    day_range_middle?: string
    day_hidden?: string
  }
  showOutsideDays?: boolean
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  mode?: 'single' | 'multiple' | 'range'
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
}

function Calendar({
  className,
  classNames,
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    }
    
    return days
  }
  
  const isSelected = (date: Date | null) => {
    if (!date || !selected) return false
    return date.toDateString() === selected.toDateString()
  }
  
  const isToday = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === new Date().toDateString()
  }
  
  const isDisabled = (date: Date | null) => {
    if (!date) return true
    return disabled ? disabled(date) : false
  }
  
  const handleDateClick = (date: Date | null) => {
    if (!date || isDisabled(date) || !onSelect) return
    onSelect(date)
  }
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={previousMonth}
          className={cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            classNames?.nav_button,
            classNames?.nav_button_previous
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className={cn("text-sm font-medium", classNames?.caption_label)}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
          className={cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            classNames?.nav_button,
            classNames?.nav_button_next
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <table className={cn("w-full border-collapse space-y-1", classNames?.table)}>
        <thead>
          <tr className={classNames?.head_row}>
            {dayNames.map((day) => (
              <th
                key={day}
                className={cn(
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  classNames?.head_cell
                )}
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(generateCalendarDays().length / 7) }, (_, weekIndex) => (
            <tr key={weekIndex} className={classNames?.row}>
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex
                const date = generateCalendarDays()[dayNumber]
                
                return (
                  <td key={dayIndex} className={cn("text-center text-sm p-0 relative", classNames?.cell)}>
                    {date && (
                      <Button
                        variant={isSelected(date) ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          isToday(date) && "bg-accent text-accent-foreground",
                          isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          isDisabled(date) && "text-muted-foreground opacity-50",
                          classNames?.day
                        )}
                        onClick={() => handleDateClick(date)}
                        disabled={isDisabled(date)}
                      >
                        {date.getDate()}
                      </Button>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }