"use client";

import { useTimezone } from "@/contexts/timezone-context";
import { getTimelineHours } from "@/lib/timezone";
import { useColumnHighlight } from "@/hooks/use-column-highlight";
import { useTimelineHover } from "@/hooks/use-timeline-hover";
import { ColumnHighlightRing } from "./column-highlight-ring";
import { TimezoneRow } from "./timezone-row";

interface TimelineVisualizationProps {
  onRemoveTimezone: (timezoneId: string) => void;
}

/**
 * Main timeline visualization component that displays multiple timezones
 * in a horizontal 24-hour timeline with interactive hover effects.
 */
export function TimelineVisualization({
  onRemoveTimezone,
}: TimelineVisualizationProps) {
  const { timezoneDisplays, setHomeTimezone } = useTimezone();
  const now = new Date();

  // Use home timezone as reference, or fallback to first timezone
  const referenceTimezone =
    timezoneDisplays.find((d) => d.timezone.isHome) || timezoneDisplays[0];
  const referenceHours = referenceTimezone
    ? getTimelineHours(referenceTimezone.timezone.id, now)
    : [];

  // Track mouse hover position
  const {
    timelineContainerRef,
    hoveredColumnIndex,
    handleMouseMove,
    handleMouseLeave,
  } = useTimelineHover(referenceHours.length);

  // Calculate which column to highlight (hover or current time)
  const { highlightedColumnIndex } = useColumnHighlight({
    referenceTimezone,
    referenceHours,
    now,
    hoveredColumnIndex,
  });

  if (timezoneDisplays.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={timelineContainerRef}
        data-timeline-container
        className="relative min-w-[800px] sm:min-w-[1200px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Single column highlight ring spanning all rows */}
        <ColumnHighlightRing
          columnIndex={highlightedColumnIndex}
          totalColumns={referenceHours.length}
          isHovered={hoveredColumnIndex !== null}
        />

        {/* Render each timezone row */}
        {timezoneDisplays.map((display) => (
          <TimezoneRow
            key={display.timezone.id}
            display={display}
            referenceHours={referenceHours}
            onRemove={onRemoveTimezone}
            onSetHome={setHomeTimezone}
          />
        ))}
      </div>
    </div>
  );
}
