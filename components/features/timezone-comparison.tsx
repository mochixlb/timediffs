"use client";

import { TimelineVisualization } from "@/components/features/timeline-visualization";
import { useTimezone } from "@/contexts/timezone-context";
import { cn } from "@/lib/utils";

export function TimezoneComparison() {
  const { timezoneDisplays, removeTimezone } = useTimezone();

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("container mx-auto px-6 py-8 sm:px-8 sm:py-12")}>
        <TimelineVisualization onRemoveTimezone={removeTimezone} />
      </div>
    </div>
  );
}
