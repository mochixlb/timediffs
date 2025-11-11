"use client";

import { TimelineVisualization } from "./timeline-visualization";
import { TimezonePicker } from "./timezone-picker";
import { DatePicker } from "./date-picker";
import { WeekView } from "./week-view";
import { TimeFormatToggle } from "./time-format-toggle";
import { useTimezone } from "@/contexts/timezone-context";
import { LogoIcon } from "@/components/logo-icon";

export function TimezoneComparison() {
  const { timezoneDisplays, removeTimezone } = useTimezone();

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1920px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground shrink-0" />
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground">
              timediffs.app
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <TimezonePicker />
            <DatePicker />
            <WeekView />
            <TimeFormatToggle />
          </div>
        </div>
        {timezoneDisplays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              No timezones added yet. Add one to get started.
            </p>
          </div>
        ) : (
          <TimelineVisualization onRemoveTimezone={removeTimezone} />
        )}
      </div>
    </div>
  );
}
