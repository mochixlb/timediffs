"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { useTimezone } from "@/contexts/timezone-context";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * Date picker component that displays a calendar for selecting dates.
 * Matches the UI/UX style of the TimezonePicker component.
 */
export function DatePicker() {
  const { selectedDate, setSelectedDate } = useTimezone();
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));
  const isMobile = useIsMobile();

  // Format the selected date for display
  const formattedDate = format(selectedDate, "MMM d, yyyy");

  // Get calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Day names (Sunday to Saturday)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateSelect = (date: Date) => {
    // Create a new date with the selected date but preserve the current time
    const updatedDate = new Date(selectedDate);
    updatedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(new Date(updatedDate));
    setOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const monthYearLabel = format(currentMonth, "MMMM yyyy");
  const today = new Date();

  // Calendar content - shared between drawer and popover
  const calendarContent = (
    <div className="p-4">
      {/* Month/Year Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-1.5 rounded-md hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-slate-900">
          {monthYearLabel}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-md hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900 cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-semibold text-slate-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(day)}
              className={`
                h-9 w-9 flex items-center justify-center text-sm rounded-md transition-colors cursor-pointer
                ${isCurrentMonth ? "text-slate-900" : "text-slate-400"}
                ${isSelected 
                  ? "bg-slate-900 text-white font-medium hover:bg-slate-800" 
                  : isToday
                  ? "bg-slate-100 text-slate-900 font-medium hover:bg-slate-200"
                  : "hover:bg-slate-200"
                }
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );

  const triggerButton = (
    <Button
      variant="outline"
      className="h-11 w-full lg:h-9 lg:min-w-[120px] lg:w-auto gap-1.5 lg:gap-2 border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 px-2.5 lg:px-4 shrink-0"
    >
      <Calendar className="h-4 w-4 shrink-0" />
      <span className="hidden lg:inline">{format(selectedDate, "MMM d")}</span>
      <span className="lg:hidden text-xs">{format(selectedDate, "MMM d")}</span>
    </Button>
  );

  // Use Drawer on mobile, Popover on desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="p-0" open={open}>
          {calendarContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border border-slate-200 shadow-sm"
        align="start"
      >
        {calendarContent}
      </PopoverContent>
    </Popover>
  );
}

