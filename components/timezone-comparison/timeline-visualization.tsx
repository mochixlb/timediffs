"use client";

import { useTimezone } from "@/contexts/timezone-context";
import { getTimelineHours } from "@/lib/timezone";
import { useColumnHighlight } from "@/hooks/use-column-highlight";
import { useTimelineHover } from "@/hooks/use-timeline-hover";
import { ColumnHighlightRing } from "./column-highlight-ring";
import { TimezoneRow } from "./timezone-row";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const prefersReducedMotion = useReducedMotion();

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
        <AnimatePresence initial={false}>
          {timezoneDisplays.map((display) => (
            <motion.div
              key={display.timezone.id}
              layout
              className="mb-4 last:mb-0"
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, height: 0, scale: 0.98 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, height: "auto", scale: 1 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0, scale: 0.98, marginBottom: 0 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.18, ease: "easeOut" }
              }
              style={{ overflow: "hidden" }}
            >
              <TimezoneRow
                display={display}
                referenceHours={referenceHours}
                onRemove={onRemoveTimezone}
                onSetHome={setHomeTimezone}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
