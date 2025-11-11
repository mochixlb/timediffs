"use client";

import { TimelineVisualization } from "./timeline-visualization";
import { TimezonePicker } from "./timezone-picker";
import { useTimezone } from "@/contexts/timezone-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TimezoneComparison() {
  const { timezoneDisplays, removeTimezone } = useTimezone();
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("container mx-auto px-6 py-8 sm:px-8 sm:py-12")}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <TimezonePicker />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9"
              onClick={() => setIsEditMode((v) => !v)}
              disabled={timezoneDisplays.length === 0}
            >
              {isEditMode ? "Done" : "Edit"}
            </Button>
          </div>
        </div>
        {timezoneDisplays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">
              No timezones added yet. Add one to get started.
            </p>
            <TimezonePicker />
          </div>
        ) : (
          <TimelineVisualization
            onRemoveTimezone={removeTimezone}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </div>
  );
}
