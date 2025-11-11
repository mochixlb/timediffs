"use client";

import { TimelineVisualization } from "./timeline-visualization";
import { TimezonePicker } from "./timezone-picker";
import { useTimezone } from "@/contexts/timezone-context";
import { cn } from "@/lib/utils";

export function TimezoneComparison() {
  const { timezoneDisplays, removeTimezone } = useTimezone();

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("container mx-auto px-6 py-8 sm:px-8 sm:py-12")}>
        <div className="mb-6">
          <TimezonePicker />
        </div>
        {timezoneDisplays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">
              No timezones added yet. Add one to get started.
            </p>
            <TimezonePicker />
          </div>
        ) : (
          <TimelineVisualization onRemoveTimezone={removeTimezone} />
        )}
      </div>
    </div>
  );
}
