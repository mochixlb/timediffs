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
        "h-9 min-w-[120px] gap-2 border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50",
        "transition-colors"
      )}
      aria-label={`Switch to ${timeFormat === "12h" ? "24-hour" : "12-hour"} time format`}
      title={`Current format: ${timeFormat === "12h" ? "12-hour (AM/PM)" : "24-hour"}. Click to switch.`}
    >
      <Clock className="h-4 w-4" />
      <span>{timeFormat === "12h" ? "12h" : "24h"}</span>
    </Button>
  );
}

