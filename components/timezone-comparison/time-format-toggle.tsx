"use client";

import { Clock } from "lucide-react";
import { useTimezone } from "@/contexts/timezone-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Time format toggle component that allows users to switch between
 * 12-hour (AM/PM) and 24-hour time formats.
 * Matches the UI/UX style of other control components.
 */
export function TimeFormatToggle() {
  const { timeFormat, setTimeFormat } = useTimezone();

  const toggleFormat = () => {
    setTimeFormat(timeFormat === "12h" ? "24h" : "12h");
  };

  return (
    <Button
      variant="outline"
      onClick={toggleFormat}
      className={cn(
        "h-11 lg:h-9 lg:min-w-[100px] lg:w-auto gap-1.5 lg:gap-2 border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 px-2.5 lg:px-4 shrink-0",
        "transition-colors"
      )}
      aria-label={`Switch to ${
        timeFormat === "12h" ? "24-hour" : "12-hour"
      } time format`}
      title={`Current format: ${
        timeFormat === "12h" ? "12-hour (AM/PM)" : "24-hour"
      }. Click to switch.`}
    >
      <Clock className="h-4 w-4 shrink-0" />
      <span className="text-xs lg:text-sm">
        {timeFormat === "12h" ? "12h" : "24h"}
      </span>
    </Button>
  );
}
