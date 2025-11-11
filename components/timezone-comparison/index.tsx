"use client";

import { TimelineVisualization } from "./timeline-visualization";
import { TimezonePicker } from "./timezone-picker";
import { DatePicker } from "./date-picker";
import { WeekView } from "./week-view";
import { useTimezone } from "@/contexts/timezone-context";

export function TimezoneComparison() {
  const { timezoneDisplays, removeTimezone } = useTimezone();

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1920px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <TimezonePicker />
          <DatePicker />
          <WeekView />
        </div>
        {timezoneDisplays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              No timezones added yet. Add one to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <TimezonePicker />
              <DatePicker />
              <WeekView />
            </div>
          </div>
        ) : (
          <TimelineVisualization onRemoveTimezone={removeTimezone} />
        )}
      </div>
    </div>
  );
}
