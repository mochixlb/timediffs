"use client";

import { useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { useTimezone } from "@/contexts/timezone-context";
import { cn } from "@/lib/utils";

/**
 * Week view component that displays the current week's dates (Sunday to Saturday) as quick action buttons.
 * Shows indicators for today and the selected date.
 * The week view always shows the current week (this week) for quick access.
 */
export function WeekView() {
  const { selectedDate, setSelectedDate } = useTimezone();

  // Get the current week (this week) - always shows the week containing today
  const weekDays = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, []); // Empty dependency array - always shows current week

  const today = new Date();

  const handleDateSelect = (date: Date) => {
    // Create a new date with the selected date but preserve the current time
    const updatedDate = new Date(selectedDate);
    updatedDate.setFullYear(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    setSelectedDate(new Date(updatedDate));
  };

  return (
    <div className="flex items-center gap-1 lg:gap-1 overflow-x-auto pb-1 -mx-1 px-1 lg:mx-0 lg:px-0 scrollbar-hide shrink-0">
      {weekDays.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const dayName = format(day, "EEE"); // Mon, Tue, etc.
        const dayNumber = format(day, "d");

        return (
          <button
            key={index}
            onClick={() => handleDateSelect(day)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[40px] lg:min-w-[40px] h-9 px-1 lg:px-1.5 rounded-md transition-colors cursor-pointer shrink-0",
              "text-xs font-medium",
              isSelected
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : isToday
                ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                : "text-slate-600 hover:bg-slate-200"
            )}
            aria-label={`Select ${format(day, "EEEE, MMMM d, yyyy")}`}
            title={format(day, "EEEE, MMMM d, yyyy")}
          >
            <span className="text-[10px] leading-tight opacity-75">
              {dayName}
            </span>
            <span className="text-sm leading-tight font-semibold">
              {dayNumber}
            </span>
          </button>
        );
      })}
    </div>
  );
}
